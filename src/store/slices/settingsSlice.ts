import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppDispatch } from "../store";
import { persistSettings } from "../../persistence/storage";
import { initialState, Settings, type Settings as SettingsClass, type Views } from "../../types/Settings";

/**
 * Slice Redux che gestisce tutte le impostazioni globali dell'app.
 * 
 * Struttura logica:
 * - State: contiene i valori correnti delle impostazioni (view, clipboardReplace, ecc.)
 * - Reducers: funzioni sincrone che aggiornano lo stato
 * - Thunk: funzioni asincrone che possono persistere lo stato o fare logica extra
 * - Selectors: funzioni per leggere in modo centralizzato e tipizzato lo stato
 */
export const settingsSlice = createSlice({
  name: "settings",
  initialState: initialState, // importato da types/Settings.ts per mantenere un'unica fonte di verità
  reducers: {
    /** Aggiorna solo la view attuale */
    setView(state, action: PayloadAction<Views>) {
      state.view = action.payload;
    },

  /** Imposta l'ID del set attivo */
  setActiveSet(state, action: PayloadAction<string | undefined>) {
      state.activeSet = action.payload;
    },

    /** Attiva/disattiva la sostituzione automatica dalla clipboard */
    setClipboardReplace(state, action: PayloadAction<boolean>) {
      state.clipboardReplace = action.payload;
    },

    /** Imposta il codice della classe numerica per i pulsanti */
    setButtonNumberClass(state, action: PayloadAction<string>) {
      state.buttonNumberClass = action.payload;
    },

    /**
     * Aggiornamento GENERICO di più proprietà in una sola dispatch.
     * Utile quando bisogna modificare più campi contemporaneamente.
     * 
     * Se aggiungi nuove proprietà a Settings, questo metodo le gestirà automaticamente.
     */
    updateMany(state, action: PayloadAction<Partial<Settings>>) {
      Object.assign(state, action.payload);
    },

    /**
     * Carica (idrata) lo stato da un oggetto Settings o da un plain object compatibile.
     * Ideale per inizializzare lo slice dopo aver letto dal persistence storage.
     * 
     * Se aggiungi nuove proprietà a Settings, assicurati di gestirle qui.
     */
    hydrateFromStorage(state, action: PayloadAction<SettingsClass | Partial<Settings>>) {
      const s = action.payload as Partial<Settings>;
      state.view = s.view ?? state.view;
      state.clipboardReplace = s.clipboardReplace ?? state.clipboardReplace;
      state.buttonNumberClass = s.buttonNumberClass ?? state.buttonNumberClass;
  state.activeSet = s.activeSet ?? state.activeSet;
    },
  },
});

export const {
  setView,
  setActiveSet,
  setClipboardReplace,
  setButtonNumberClass,
  updateMany,
  hydrateFromStorage,
} = settingsSlice.actions;

/**
 * Thunk di utilità:
 * Aggiorna lo stato e lo persiste in memoria in un'unica operazione.
 * Usa questo quando vuoi modificare impostazioni e salvarle subito.
 */
export const updateSettingsAndPersist =
  (patch: Partial<Settings>) =>
    async (dispatch: AppDispatch) => {
      dispatch(updateMany(patch));
      try {
        await persistSettings(patch);
      } catch (error) {
        console.error("Errore nel salvataggio delle impostazioni", error);
      }
    };

/**
 * Selectors Redux:
 * Funzioni centralizzate e tipizzate per leggere lo stato.
 * Vantaggi:
 * - Evitano duplicazione del path (state.settings.qualcosa) nei componenti
 * - Rendono più sicuro il refactoring se cambia la struttura dello stato
 */
export const selectSettings = (state: { settings: Settings }) => state.settings;
export const selectView = (state: { settings: Settings }) => state.settings.view;
export const selectClipboardReplace = (state: { settings: Settings }) =>
  state.settings.clipboardReplace;
export const selectButtonNumberClass = (state: { settings: Settings }) =>
  state.settings.buttonNumberClass;
export const selectActiveSet = (state: { settings: Settings }) => state.settings.activeSet;

export default settingsSlice.reducer;
