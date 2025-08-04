/// <reference types="chrome" />
import { setUseClipboard } from "../store/slices/settingsSlice"
import type { Wassa } from "../types/Wassa"
import type { Dispatch } from "redux";

export const saveWassas = async (wassas: Wassa[]) => {
  await chrome.storage.sync.set({ wassas })
}

export const loadWassas = async (): Promise<Wassa[]> => {
  const result = await chrome.storage.sync.get("wassas")
  return result.wassas || []
}

// Mantengo le vecchie funzioni per compatibilità durante la migrazione
export const savePrompts = async (wassas: Wassa[]) => {
  await chrome.storage.sync.set({ wassas })
}

export const loadPrompts = async (): Promise<Wassa[]> => {
  const result = await chrome.storage.sync.get("wassas")
  return result.wassas || []
}

export const SETTINGS_KEY = "settings"

export async function saveSettings(settings: { useClipboard: boolean; buttonNumberClass?: string }) {
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

export const loadUseClipboardFromStorage = () => async (dispatch: Dispatch) => {
  try {
    console.log('🔄 Caricando impostazioni dal storage...');
    const settings = await loadSettings();
    console.log('📄 Impostazioni caricate:', settings);
    
    // Se useClipboard non esiste, usa il default true
    const useClipboard = settings.useClipboard !== undefined ? settings.useClipboard : true;
    console.log('✅ Settando useClipboard a:', useClipboard);
    dispatch(setUseClipboard(useClipboard));
    
    // Se buttonNumberClass non esiste, usa il default "53"
    const buttonNumberClass = settings.buttonNumberClass !== undefined ? settings.buttonNumberClass : "53";
    console.log('✅ Settando buttonNumberClass a:', buttonNumberClass);
    const { setButtonNumberClass } = await import("../store/slices/settingsSlice");
    dispatch(setButtonNumberClass(buttonNumberClass));
  } catch (error) {
    console.error("Errore nel caricamento delle impostazioni", error);
    // In caso di errore, usa i default
    dispatch(setUseClipboard(true));
    const { setButtonNumberClass } = await import("../store/slices/settingsSlice");
    dispatch(setButtonNumberClass("53"));
  }
};

// Thunk per caricare le wassas dal storage (stesso pattern dei settings)
export const loadWassasFromStorage = () => async (dispatch: Dispatch) => {
  try {
    const wassas = await loadWassas();
    // Importiamo setWassas dal wassaSlice
    const { setWassas } = await import("../store/slices/wassaSlice");
    dispatch(setWassas(wassas));
  } catch (error) {
    console.error("Errore nel caricamento delle wassas", error);
  }
};

// Mantengo la vecchia funzione per compatibilità
export const loadPromptsFromStorage = () => async (dispatch: Dispatch) => {
  try {
    const wassas = await loadWassas();
    // Importiamo setWassas dal wassaSlice (ora prompts sono wassas)
    const { setWassas } = await import("../store/slices/wassaSlice");
    dispatch(setWassas(wassas));
  } catch (error) {
    console.error("Errore nel caricamento delle wassas", error);
  }
};

