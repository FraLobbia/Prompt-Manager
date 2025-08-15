// src/persistence/storage.thunks.ts
import type { Dispatch } from "redux";
import { hydrateFromStorage } from "../store/slices/settingsSlice";
import { setPrompts, addPrompt, updatePrompt, removePrompt } from "../store/slices/promptSlice";
import { setPromptSets } from "../store/slices/promptSetsSlice";
import { loadSettings, loadPrompts, loadPromptSets } from "./storage";
import { upsertPrompt, deletePrompt } from "./storage.prompts";

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

/** CRUD granulari consigliati per Prompt (riduce scritture e quote) */
export const addPromptAndSave = (p: Parameters<typeof addPrompt>[0]) => async (dispatch: Dispatch) => {
  dispatch(addPrompt(p));
  await upsertPrompt(p);
};

export const updatePromptAndSave = (p: Parameters<typeof updatePrompt>[0]) => async (dispatch: Dispatch) => {
  dispatch(updatePrompt(p));
  await upsertPrompt(p);
};

export const removePromptAndSave = (id: string) => async (dispatch: Dispatch) => {
  dispatch(removePrompt(id));
  await deletePrompt(id);
};
