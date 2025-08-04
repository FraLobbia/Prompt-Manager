import { setUseClipboard, setButtonNumberClass } from "../store/slices/settingsSlice";
import { setWassas } from "../store/slices/wassaSlice";
import type { Wassa } from "../types/Wassa";
import type { Dispatch } from "redux";

export const SETTINGS_KEY = "settings";

// Wassas

export const persistWassas = async (wassas: Wassa[]) => {
  await chrome.storage.sync.set({ wassas });
};

export const loadWassas = async (): Promise<Wassa[]> => {
  const result = await chrome.storage.sync.get("wassas");
  return result.wassas || [];
};

// Settings

export async function persistSettings(settings: { useClipboard: boolean; buttonNumberClass?: string }) {
  return new Promise<void>((resolve) => {
    chrome.storage.sync.set({ [SETTINGS_KEY]: settings }, () => resolve());
  });
}

export async function loadSettings(): Promise<{ useClipboard?: boolean; buttonNumberClass?: string }> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SETTINGS_KEY], (result) => {
      const settings = result[SETTINGS_KEY] || { useClipboard: true, buttonNumberClass: "53" };
      resolve(settings);
    });
  });
}

// Thunks Redux

/**
 * Carica le impostazioni dal chrome.storage e le imposta nello stato Redux
 */
export const loadSettingsFromStorage = () => async (dispatch: Dispatch) => {
  try {
    const settings = await loadSettings();
    const useClipboard = settings.useClipboard !== undefined ? settings.useClipboard : true;
    const buttonNumberClass = settings.buttonNumberClass !== undefined ? settings.buttonNumberClass : "53";

    dispatch(setUseClipboard(useClipboard));
    dispatch(setButtonNumberClass(buttonNumberClass));
  } catch (error) {
    console.error("Errore nel caricamento delle impostazioni", error);
    dispatch(setUseClipboard(true));
    dispatch(setButtonNumberClass("53"));
  }
};

/**
 * Carica le wassas dal chrome.storage e le imposta nello stato Redux
 */
export const loadWassasFromStorage = () => async (dispatch: Dispatch) => {
  try {
    const wassas = await loadWassas();
    dispatch(setWassas(wassas));
  } catch (error) {
    console.error("Errore nel caricamento delle wassas", error);
  }
};
