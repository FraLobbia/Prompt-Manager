// src/persistence/storage.prompts.ts
import type { Prompt } from "../types/Prompt";
import { PROMPTS_INDEX_KEY, promptByIdKey } from "./storage.keys";
import {
  writeWithSyncFallback,
  storageGet,
  storageSet,
  storageRemove,
} from "./storage.core";
import type { StorageArea } from "./storage.core";

/** Calcola la dimensione byte del JSON (UTF-8) */
const jsonByteSize = (obj: unknown) => new TextEncoder().encode(JSON.stringify(obj)).length;
/** Soglia prudente per singolo item sync (~8KB hard) */
const SYNC_SAFE_ITEM = 7000;

/** Scrive un prompt singolo:
 *  - se piccolo: usa chrome.storage.sync.set diretto
 *  - se grande: usa writeWithSyncFallback (chunking + fallback local)
 */
async function writeOnePrompt(p: Prompt) {
  const key = promptByIdKey(p.id);
  if (jsonByteSize(p) <= SYNC_SAFE_ITEM) {
    await storageSet("sync", { [key]: p });
  } else {
    await writeWithSyncFallback(key, p);
  }
}

/** Aggiorna l’indice degli ID in modo idempotente */
async function upsertIndex(addId?: string, removeId?: string) {
  const res = await storageGet<Record<string, unknown>>("sync", [PROMPTS_INDEX_KEY]).catch(() => ({} as Record<string, unknown>));
  const curr: string[] = Array.isArray(res[PROMPTS_INDEX_KEY]) ? (res[PROMPTS_INDEX_KEY] as string[]) : [];
  let next = curr;

  if (addId && !curr.includes(addId)) next = [...curr, addId];
  if (removeId) next = next.filter((x) => x !== removeId);

  // Confronto referenziale: se è cambiato, scrivi
  if (next !== curr) {
    await storageSet("sync", { [PROMPTS_INDEX_KEY]: next });
  }
}

/** Inserisci/Aggiorna un prompt */
export async function upsertPrompt(p: Prompt) {
  await writeOnePrompt(p);
  await upsertIndex(p.id, undefined);
}

/** Elimina un prompt */
export async function deletePrompt(id: string) {
  await storageRemove("sync", promptByIdKey(id));
  await upsertIndex(undefined, id);
}

/** Carica tutti i prompt granulari */
export async function loadAllPrompts(): Promise<Prompt[]> {
  const res = await storageGet<Record<string, unknown>>("sync", [PROMPTS_INDEX_KEY]).catch(() => ({} as Record<string, unknown>));
  const idx: string[] = Array.isArray(res[PROMPTS_INDEX_KEY]) ? (res[PROMPTS_INDEX_KEY] as string[]) : [];
  if (idx.length === 0) return [];

  const keys = idx.map(promptByIdKey);
  const byId = await storageGet<Record<string, unknown>>("sync", keys).catch(() => ({} as Record<string, unknown>));

  // Ritorna rispettando l’ordine dell’indice, scartando eventuali buchi
  return idx
    .map((id) => byId[promptByIdKey(id)] as Prompt | undefined)
    .filter((p): p is Prompt => Boolean(p));
}

/** Migrazione dal blob legacy PROMPTS_KEY → schema granulare */
export async function migratePromptsIfNeeded(legacyPrompts?: Prompt[]) {
  if (!Array.isArray(legacyPrompts) || legacyPrompts.length === 0) return;

  // scrivi indice
  const idx = legacyPrompts.map((p) => p.id);
  await storageSet("sync", { [PROMPTS_INDEX_KEY]: idx });

  // scrivi ogni prompt (chunk per oversize se serve)
  for (const p of legacyPrompts) {
    // eslint-disable-next-line no-await-in-loop
    await writeOnePrompt(p);
  }
}

/** Helper per leggere un singolo prompt da un’area specifica (opzionale) */
export async function getPrompt(area: StorageArea, id: string): Promise<Prompt | undefined> {
  const key = promptByIdKey(id);
  const res = await storageGet<Record<string, unknown>>(area, [key]);
  return res[key] as Prompt | undefined;
}
