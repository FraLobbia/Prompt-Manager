// src/persistence/storage.ts
import { hydrateFromStorage } from "../store/slices/settingsSlice";
import { setPrompts } from "../store/slices/promptSlice";
import { setPromptSets } from "../store/slices/promptSetsSlice";
import { Settings, initialState } from "../types/Settings";
import type { Prompt } from "../types/Prompt";
import type { PromptSet } from "../types/PromptSet";
import type { Dispatch } from "redux";

/** Chiavi di storage */
export const SETTINGS_KEY = "settings";
// New canonical keys
export const PROMPTS_KEY = "prompts";
export const PROMPT_SETS_KEY = "promptSets";


/** ------------------------
 *  Adattatori Settings
 *  ------------------------ */

/**
 * Forma serializzata nello storage (con supporto legacy)
 * Serve a convertire le impostazioni in un formato adatto per lo storage.
 */
type StoredSettings = {
  view: Settings["view"] | "newPrompt" | "editPrompt";
  clipboardReplace: boolean;
  buttonNumberClass: string;
  activeSet?: string; // solo ID
  /** legacy support (vecchia chiave) */
  useClipboard?: boolean;
};

/**
 * Serializza Settings -> StoredSettings
 * Serve a convertire le impostazioni in un formato adatto per lo storage.
 *
 * @param s Le impostazioni da serializzare
 * @returns Le impostazioni serializzate
 */
function toStored(s: Settings): StoredSettings {
  return {
    view: s.view,
    clipboardReplace: s.clipboardReplace,
    buttonNumberClass: s.buttonNumberClass,
  activeSet: s.activeSet,
  };
}

/**
 * Deserializza StoredSettings -> Settings, usando `initialState` come unico default.
 * Serve a garantire che tutte le proprietà siano presenti.
 * @param obj L'oggetto da deserializzare
 * @returns L'oggetto deserializzato
 */
function fromStored(obj: Partial<StoredSettings> | undefined): Settings {
  if (!obj) {
    console.warn("Nessun oggetto da deserializzare, uso stato iniziale.");
    return { ...initialState };
  }

  const activeSetId = ((): string | undefined => {
    const raw = (obj as unknown as { activeSet?: unknown })?.activeSet
    if (raw == null) return undefined
    if (typeof raw === "string") return raw
    if (typeof raw === "object") {
      const maybe = raw as { id?: unknown }
      if (typeof maybe.id === "string") return maybe.id
    }
    return undefined
  })()

  const view = ((): Settings["view"] => {
    const v = obj.view ?? initialState.view
    // map legacy views
    if (v === "newPrompt") return "newPrompt"
    if (v === "editPrompt") return "editPrompt"
    return v as Settings["view"]
  })()

  return {
    view,
    clipboardReplace:
      obj.clipboardReplace ?? obj.useClipboard ?? initialState.clipboardReplace,
    buttonNumberClass: obj.buttonNumberClass ?? initialState.buttonNumberClass,
    activeSet: activeSetId ?? initialState.activeSet,
  };
}

/**
 * Esegue un merge immutabile tra le impostazioni di base e una patch.
 * Serve a combinare le impostazioni esistenti con eventuali modifiche.
 * @param base Le impostazioni di base
 * @param patch La patch da applicare
 * @returns Le impostazioni risultanti dopo il merge
 */
function mergeSettings(base: Settings, patch: Partial<Settings>): Settings {
  return {
    view: patch.view ?? base.view,
    clipboardReplace: patch.clipboardReplace ?? base.clipboardReplace,
    buttonNumberClass: patch.buttonNumberClass ?? base.buttonNumberClass,
    activeSet: patch.activeSet ?? base.activeSet,
  };
}

/** ------------------------
 *  Prompts
 *  ------------------------ */

/**
 * Persisti i prompt nello storage.
 * @param prompts I prompt da persistere
 */
export const persistPrompts = async (prompts: Prompt[]) => {
  await chrome.storage.sync.set({ [PROMPTS_KEY]: prompts });
};

/**
 * Carica i prompt dallo storage.
 * @returns I prompt caricati
 */
export const loadPrompts = async (): Promise<Prompt[]> => {
  const result = await chrome.storage.sync.get([PROMPTS_KEY, PROMPTS_KEY]);
  // Preferisci la chiave nuova, fallback alla legacy
  return (result[PROMPTS_KEY] as Prompt[]) || (result[PROMPTS_KEY] as Prompt[]) || [];
};

/** ------------------------
 *  Settings 
 *  ------------------------ */

/**
 * Carica le impostazioni dallo storage.
 * @returns Le impostazioni caricate
 */
export async function loadSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SETTINGS_KEY], (result) => {
      const stored = result[SETTINGS_KEY] as StoredSettings | undefined;
      resolve(fromStored(stored));
    });
  });
}

/**
 * Persisti impostazioni:
 * - Se passi una istanza di classe `Settings`, salva così com'è.
 * - Se passi un `Partial<Settings>`, carica l'attuale, fai merge e salva.
 */
export async function persistSettings(settings: Settings | Partial<Settings>) {
  let toSave: Settings;

  if (settings instanceof Settings) {
    // Istanza di classe completa: salvo direttamente
    toSave = settings;
  } else {
    // Patch parziale: leggo stato corrente e faccio merge
    const current = await loadSettings();
    toSave = mergeSettings(current, settings);
  }

  const plain = toStored(toSave);
  return new Promise<void>((resolve) => {
    chrome.storage.sync.set({ [SETTINGS_KEY]: plain }, () => resolve());
  });
}

/** ------------------------
 *  Prompt Sets
 *  ------------------------ */

/**
 * Persisti i PromptSet nello storage (uniforme alle altre persist*).
 */
export const persistPromptSets = async (sets: PromptSet[]) => {
  await chrome.storage.sync.set({ [PROMPT_SETS_KEY]: sets });
};

/**
 * Carica i PromptSet dallo storage (uniforme alle altre load*).
 */
export const loadPromptSets = async (): Promise<PromptSet[]> => {
  const result = await chrome.storage.sync.get([PROMPT_SETS_KEY, PROMPT_SETS_KEY]);
  return (result[PROMPT_SETS_KEY] as PromptSet[]) || (result[PROMPT_SETS_KEY] as PromptSet[]) || [];
};

/** ------------------------
 *  Thunks Redux
 * NB: Un thunk è una funzione che incapsula la logica asincrona e può dispatchare azioni.
 *
 * Un thunk è una funzione che, invece di restituire subito un'azione,
 * restituisce un'altra funzione che Redux esegue con `dispatch` e `getState`.
 * Questo permette di:
 * - Eseguire logica asincrona (es. lettura/scrittura su `chrome.storage`, chiamate API)
 * - Dispatchare più azioni in momenti diversi (prima/dopo l'operazione)
 * - Mantenere i reducer puri e privi di side-effect
 *
 * Esempio d'uso:
 * ```ts
 * dispatch(loadSettingsFromStorage());
 * ```
 * Nel caso sopra, il thunk legge le impostazioni da storage in modo asincrono
 * e poi aggiorna lo stato tramite un'azione normale (`hydrateFromStorage`).
 *  ------------------------ */

/**
 * Carica le impostazioni dallo storage persistente e invia un'azione per idratare lo stato.
 *
 * Tenta di recuperare asincronamente le impostazioni tramite `loadSettings()`. In caso di successo,
 * invia l'azione `hydrateFromStorage` con le impostazioni caricate. Se si verifica un errore,
 * lo registra nella console. Opzionalmente, puoi inviare uno stato di fallback.
 *
 * @returns {Function} Una funzione thunk che accetta il `dispatch` di Redux e gestisce il caricamento e l'invio.
 *
 * @example
 * dispatch(loadSettingsFromStorage());
 */
export const loadSettingsFromStorage = () => async (dispatch: Dispatch) => {
  try {
    const settings = await loadSettings();
    dispatch(hydrateFromStorage(settings));
  } catch (err) {
    console.error("Errore nel caricamento settings", err);
    // opzionale: fallback esplicito
    // dispatch(hydrateFromStorage(initialState)) 
  }
};

/**
 * Carica le prompts dalla memoria di archiviazione e le inserisce nello stato tramite dispatch.
 *
 * @returns {Function} Una funzione thunk che effettua il dispatch delle prompts caricate.
 */
export const loadPromptsFromStorage = () => async (dispatch: Dispatch) => {
  try {
  const prompts = await loadPrompts();
  dispatch(setPrompts(prompts));
  } catch (error) {
  console.error("Errore nel caricamento dei prompt", error);
  }
};

/**
 * Carica i PromptSet dalla memoria e li inserisce nello stato tramite dispatch.
 */
export const loadPromptSetsFromStorage = () => async (dispatch: Dispatch) => {
  try {
  const sets = await loadPromptSets();
  dispatch(setPromptSets(sets));
  } catch (error) {
  console.error("Errore nel caricamento dei PromptSet", error);
  }
};
