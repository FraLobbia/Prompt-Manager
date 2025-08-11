// src/persistence/storage.core.ts

/* ======================================================================
   SUPPORTO QUOTE chrome.storage.sync (chunking + fallback su storage.local)
   ----------------------------------------------------------------------
   - chrome.storage.sync ha limiti: ~100KB totali, ~8KB per singolo item.
   - Per dati potenzialmente grandi (prompts e promptSets) applichiamo:
     * serializzazione JSON
     * chunking (split della stringa in pezzi < 8KB)
     * scrittura dei chunk come chiavi distinte + una chiave meta
   - In caso di errore/quota superata, fallback automatico su storage.local
   - In lettura:
     * proviamo prima a leggere i chunk (formato nuovo)
     * se non presenti, proviamo il formato legacy "singola chiave"
   ====================================================================== */

export type StorageArea = "sync" | "local";

/** Prefissi per meta e chunk delle chiavi */
export const META_SUFFIX = "__meta";
export const CHUNK_SUFFIX = "__chunk__";

/** Dimensione massima del singolo item su sync: 8192 byte circa.
 *  Restiamo sotto la soglia con un margine (7000 byte) per sicurezza. */
export const SYNC_SAFE_CHUNK_SIZE = 7000;

/** Struttura metadati per oggetti chunked */
type ChunkMeta = { v: number; chunkCount: number };

/** Risultato di storageGet per metadati */
type MetaGetResult = Record<string, ChunkMeta | undefined>;

/** Promise wrapper per chrome.storage.set con gestione errori */
export function storageSet(
  area: StorageArea,
  items: Record<string, unknown>
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].set(items, () => {
      const err = chrome.runtime.lastError;
      if (err) return reject(err);
      resolve();
    });
  });
}

/** Promise wrapper per chrome.storage.get */
export function storageGet<T extends Record<string, unknown>>(
  area: StorageArea,
  keys?: string[] | string | null
): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].get(keys as string[] | string | null, (result: unknown) => {
      const err = chrome.runtime.lastError;
      if (err) return reject(err);
      resolve(result as T);
    });
  });
}

/** Promise wrapper per chrome.storage.remove */
export function storageRemove(
  area: StorageArea,
  keys: string[] | string
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].remove(keys as string[] | string, () => {
      const err = chrome.runtime.lastError;
      if (err) return reject(err);
      resolve();
    });
  });
}

/** Spezza una stringa in chunk di dimensione massima specificata */
export function chunkString(input: string, maxLen = SYNC_SAFE_CHUNK_SIZE): string[] {
  const out: string[] = [];
  for (let i = 0; i < input.length; i += maxLen) {
    out.push(input.slice(i, i + maxLen));
  }
  return out;
}

/** Scrive un oggetto grande in chunk (area = 'sync' o 'local') */
export async function writeLargeObject(
  area: StorageArea,
  baseKey: string,
  obj: unknown
): Promise<void> {
  // Serializza in stringa
  const json = JSON.stringify(obj);
  const chunks = chunkString(json);
  const metaKey = `${baseKey}${META_SUFFIX}`;
  const chunkPrefix = `${baseKey}${CHUNK_SUFFIX}`;

  // Prima: rimuovi eventuali chunk/metadati precedenti (se esistono)
  try {
    const prevMeta = await storageGet<MetaGetResult>(area, [metaKey]);
    const prevCount: number | undefined = prevMeta?.[metaKey]?.chunkCount;
    if (typeof prevCount === "number" && prevCount > 0) {
      const prevKeys = Array.from({ length: prevCount }, (_, i) => `${chunkPrefix}${i}`);
      await storageRemove(area, [...prevKeys, metaKey]);
    }
  } catch {
    // Se fallisce la rimozione/lettura pregressa, ignoriamo: non blocca la scrittura nuova
  }

  // Scrivi i chunk
  const payload: Record<string, string> = {};
  chunks.forEach((c, idx) => {
    payload[`${chunkPrefix}${idx}`] = c;
  });
  await storageSet(area, payload);

  // Scrivi metadati
  const meta: Record<string, ChunkMeta> = { [metaKey]: { v: 1, chunkCount: chunks.length } };
  await storageSet(area, meta);
}

/** Legge un oggetto grande dai chunk se presenti;
 *  se non trova meta/chunk, prova il formato legacy a singola chiave. */
export async function readLargeObject<T>(
  area: StorageArea,
  baseKey: string
): Promise<T | undefined> {
  const metaKey = `${baseKey}${META_SUFFIX}`;
  const chunkPrefix = `${baseKey}${CHUNK_SUFFIX}`;

  // Prova meta+chunk (nuovo formato)
  try {
    const meta = await storageGet<MetaGetResult>(area, [metaKey]);
    const count: number | undefined = meta?.[metaKey]?.chunkCount;
    if (typeof count === "number" && count > 0) {
      const keys = Array.from({ length: count }, (_, i) => `${chunkPrefix}${i}`);
      const data = await storageGet<Record<string, string | undefined>>(area, keys);
      const json = keys.map((k) => data[k] ?? "").join("");
      return JSON.parse(json) as T;
    }
  } catch {
    // Se fallisce, continuiamo con il fallback legacy
  }

  // Fallback legacy: prova a leggere il valore direttamente con la chiave base
  try {
    const legacy = await storageGet<Record<string, unknown>>(area, [baseKey]);
    const value = legacy?.[baseKey] as T | undefined;
    if (value !== undefined) return value;
  } catch {
    // Ignora: restituiamo undefined
  }

  return undefined;
}

/** Scrive su sync con chunking, se quota superata o altro errore → fallback su local */
export async function writeWithSyncFallback(baseKey: string, obj: unknown): Promise<void> {
  try {
    await writeLargeObject("sync", baseKey, obj);
  } catch (err) {
    console.warn(`[storage.sync] fallita per "${baseKey}", fallback su storage.local`, err);
    await writeLargeObject("local", baseKey, obj);
  }
}

/** Legge prima da sync (chunk/legacy), se niente → prova local (chunk/legacy) */
export async function readWithSyncFallback<T>(baseKey: string): Promise<T | undefined> {
  const fromSync = await readLargeObject<T>("sync", baseKey);
  if (fromSync !== undefined) return fromSync;

  const fromLocal = await readLargeObject<T>("local", baseKey);
  if (fromLocal !== undefined) return fromLocal;

  return undefined;
}
