import { createSlice, type PayloadAction} from "@reduxjs/toolkit";
import { saveSettings } from "../../utils/storage";
import type { AppDispatch } from "../store";

type SettingsState = {
  useClipboard: boolean;
};

const initialState: SettingsState = {
  useClipboard: true, // valore di default
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setUseClipboard(state, action: PayloadAction<boolean>) {
      state.useClipboard = action.payload;
    },
    // Azione che triggera il middleware per il salvataggio automatico
    updateUseClipboardAuto(state, action: PayloadAction<boolean>) {
      state.useClipboard = action.payload;
    },
  },
});

export const { setUseClipboard, updateUseClipboardAuto } = settingsSlice.actions;

// Thunk che aggiorna lo stato e salva la configurazione in chrome.storage
export const updateUseClipboard = (value: boolean) => async (dispatch: AppDispatch) => {
  console.log('🔄 Aggiornando useClipboard a:', value);
  dispatch(setUseClipboard(value));
  try {
    console.log('💾 Salvando nel storage...');
    await saveSettings({ useClipboard: value });
    console.log('✅ Salvataggio completato');
  } catch (error) {
    console.error("Errore nel salvataggio delle impostazioni", error);
  }
};

export default settingsSlice.reducer;
