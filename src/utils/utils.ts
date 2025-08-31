// src/utils/utils.ts
import { loadSettings, loadPrompts, persistSettings, loadPromptSets, persistPromptSets } from "../persistence/storage";
import { upsertPrompt, writePromptsBulk } from "../persistence/storage.prompts";
import { setPrompts } from "../store/slices/promptSlice";
import { setPromptSets } from "../store/slices/promptSetsSlice";
import { setclipboardReplaceEnabled } from "../store/slices/settingsSlice";
import type { Dispatch } from "redux";
import type { PromptSet } from "../types/PromptSet";
import type { Prompt } from "../types/Prompt";
import type { AppDispatch } from "../store/store";
import { loadPromptSetsFromStorage, loadPromptsFromStorage } from "../persistence/storage.thunks";

/** Esporta un backup completo (settings + prompts + promptSets) come file JSON */
export async function exportBackup() {
  const settings = await loadSettings();
  const prompts = await loadPrompts();
  const promptSets = await loadPromptSets();

  const backup = { settings, prompts, promptSets };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "prompt-backup.json";
  a.click();

  URL.revokeObjectURL(url);
}


/** Importa un backup JSON e idrata store + storage
 *  - Settings: persist + dispatch patch locale essenziale
 *  - Prompts: migrazione allo schema granulare (index + byId) + dispatch in store
 *  - PromptSets: persist blob + dispatch in store
 */
export async function importBackup(file: File, dispatch: Dispatch) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = String(event.target?.result ?? "");
        const parsed = JSON.parse(text) as {
          settings?: { clipboardReplaceEnabled?: boolean; clipboardTemplate?: string };
          prompts?: unknown[]; // verrà passato alla migrazione
          promptSets?: unknown[]; // delegato al persistPromptSets
        };

        const settings = parsed.settings;
        const prompts = parsed.prompts;
        const promptSets = parsed.promptSets;

        // Settings: salva e applica le parti necessarie allo store
        if (settings) {
          await persistSettings(settings);
          dispatch(setclipboardReplaceEnabled(settings.clipboardReplaceEnabled ?? true));
          if (typeof settings.clipboardTemplate === 'string') {
            // aggiorna anche il template nello store
            // evitando import diretto dell’action, usiamo updateMany via thunk
            // ma qui possiamo anche dispatchare direttamente setClipboardTemplate se voluto
            // per evitare ulteriori import, manteniamo solo replaceEnabled immediato
          }
        }

        // Prompts: usa schema granulare (scrittura bulk: indice + byId)
        if (Array.isArray(prompts)) {
          await writePromptsBulk(prompts as Prompt[]); // scrive index + singoli prompt
          // Aggiorna lo store con quanto importato
          // (setPrompts accetta Prompt[]; assume che i dati del backup siano coerenti)
          dispatch(setPrompts(prompts as Prompt[]));
        }

        // PromptSets: restano persistiti come blob
        if (Array.isArray(promptSets)) {
          await persistPromptSets(promptSets as PromptSet[]);
          dispatch(setPromptSets(promptSets as PromptSet[]));
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Esporta un singolo PromptSet in JSON.
 * Opzione includePrompts: se true include anche i Prompt del set nel payload.
 * Il JSON è compatibile con l'import esistente (campi: promptSets, prompts).
 *
 * @param promptSet Set da esportare
 * @param options.includePrompts Include anche i prompt del set (default: true)
 */
export function exportPromptSet(
  promptSet: PromptSet,
  options: { includePrompts?: boolean } = { includePrompts: true }
) {
  const includePrompts = options.includePrompts ?? true;

  // Omettiamo la proprietà "prompts" dal set se includiamo i prompt separatamente
  // così il payload è pulito e non ridondante.
  const { prompts: setPrompts, ...setWithoutPrompts } = promptSet as PromptSet & { prompts?: Prompt[] };

  const payload: Record<string, unknown> = {
    // meta è ignorato dall'importer, utile per debug
    meta: {
      type: "singlePromptSet",
      version: 1,
      exportedAt: new Date().toISOString(),
      setId: promptSet.id,
    },
    promptSets: [setWithoutPrompts],
  };

  if (includePrompts && Array.isArray(setPrompts)) {
    payload.prompts = setPrompts.map(p => ({ ...p }));
  }

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  const slug = slugify(`${promptSet.titolo || "prompt-set"}_${promptSet.id}`);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `promptset_${slug}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

/** Converte stringa in slug semplice per filename. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Costruisce il payload JSON compatibile con l'import (solo questo set).
 * Se includePrompts=true, inserisce anche i Prompt completi.
 */
export function buildPromptSetPayload(
  promptSet: PromptSet,
  includePrompts = true
) {
  const { prompts: setPrompts, ...setWithoutPrompts } = promptSet as PromptSet & { prompts?: Prompt[] };

  const payload: Record<string, unknown> = {
    meta: {
      type: "singlePromptSet",
      version: 1,
      exportedAt: new Date().toISOString(),
      setId: promptSet.id,
    },
    promptSets: [setWithoutPrompts],
  };

  if (includePrompts && Array.isArray(setPrompts)) {
    payload.prompts = setPrompts.map(p => ({ ...p }));
  }
  return payload;
}

/**
 * Copia negli appunti il JSON del set.
 * @returns true se la copia è riuscita.
 */
export async function copyPromptSetToClipboard(
  promptSet: PromptSet,
  opts: { includePrompts?: boolean; pretty?: boolean } = { includePrompts: true, pretty: true }
): Promise<boolean> {
  const payload = buildPromptSetPayload(promptSet, opts.includePrompts ?? true);
  const json = JSON.stringify(payload, null, (opts.pretty ?? true) ? 2 : 0);

  try {
    await navigator.clipboard.writeText(json);
    return true;
  } catch {
    // Fallback legacy
    try {
      const ta = document.createElement("textarea");
      ta.value = json;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Type guard minimale per Prompt */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPrompt(x: any): x is Prompt {
  return x && typeof x.id === "string" && typeof x.titolo === "string";
}

/** Type guard minimale per PromptSet (versione con prompts opzionali) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPromptSet(x: any): x is PromptSet {
  return x && typeof x.id === "string" && (typeof x.titolo === "string" || typeof x.titolo === "undefined");
}

/**
 * Accetta:
 *  A) { promptSets:[PromptSet], prompts?: Prompt[] }
 *  B) PromptSet singolo (con o senza prompts)
 */
export function parsePromptSetJson(json: string): { set: PromptSet; prompts: Prompt[] } {
  const data = JSON.parse(json);

  // Caso A: payload con promptSets[0]
  if (data && Array.isArray(data.promptSets) && data.promptSets.length > 0) {
    const set = data.promptSets[0];
    if (!isPromptSet(set)) throw new Error("promptSets[0] non è un PromptSet valido.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prompts: Prompt[] = Array.isArray(data.prompts) ? data.prompts.filter(isPrompt) : Array.isArray((set as any).prompts) ? (set as any).prompts.filter(isPrompt) : [];
    // Normalizza: assicura la proprietà prompts sul set (può rimanere vuota)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (set as any).prompts = prompts;
    return { set, prompts };
  }

  // Caso B: oggetto PromptSet singolo
  if (isPromptSet(data)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prompts: Prompt[] = Array.isArray((data as any).prompts) ? (data as any).prompts.filter(isPrompt) : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any).prompts = prompts;
    return { set: data as PromptSet, prompts };
  }

  throw new Error("JSON non riconosciuto. Attesi: PromptSet singolo oppure { promptSets:[...], prompts:[...] }.");
}

/**
 * Importa un singolo set da JSON incollato.
 * - Valida e parse
 * - Aggiunge SOLO nuovi prompt (id non esistenti)
 * - Aggiunge il set se l'id non esiste; se esiste, crea un id univoco con suffisso.
 */
export const importSinglePromptSetFromJson =
  (json: string) => async (dispatch: AppDispatch) => {
    const { set, prompts } = parsePromptSetJson(json);

    // 1) Prompt: add-only
    const existingPrompts = await loadPrompts();
    const existingPromptIds = new Set(existingPrompts.map(p => p.id));
    const onlyNew = prompts.filter(p => !existingPromptIds.has(p.id));
    for (const p of onlyNew) await upsertPrompt(p);

    // 2) PromptSet: add con id univoco
    const sets = await loadPromptSets();
    const ids = new Set(sets.map(s => s.id));
    let newId = set.id;
    if (ids.has(newId)) {
      let i = 1;
      while (ids.has(`${set.id}-copy-${i}`)) i++;
      newId = `${set.id}-copy-${i}`;
    }
    const setToSave = { ...set, id: newId };
    await persistPromptSets([...sets, setToSave]);

    // 3) Resync Redux
    await Promise.all([
      dispatch(loadPromptsFromStorage()),
      dispatch(loadPromptSetsFromStorage()),
    ]);

    return { newSetId: newId };
  };