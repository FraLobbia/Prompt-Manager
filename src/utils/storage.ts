/// <reference types="chrome" />
import { setUseClipboard } from "../store/slices/settingsSlice"
import type { Prompt } from "../types/Prompt"
import type { Dispatch } from "redux";

export const savePrompts = async (prompts: Prompt[]) => {
  await chrome.storage.sync.set({ prompts })
}

export const loadPrompts = async (): Promise<Prompt[]> => {
  const result = await chrome.storage.sync.get("prompts")
  return result.prompts || []
}

export const SETTINGS_KEY = "settings"

export async function saveSettings(settings: { useClipboard: boolean }) {
  return new Promise<void>((resolve) => {
    chrome.storage.sync.set({ [SETTINGS_KEY]: settings }, () => resolve());
  });
}

export async function loadSettings(): Promise<{ useClipboard?: boolean }> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([SETTINGS_KEY], (result) => {
      const settings = result[SETTINGS_KEY] || { useClipboard: true };
      resolve(settings);
    });
  });
}

export const loadUseClipboardFromStorage = () => async (dispatch: Dispatch) => {
  try {
    console.log('🔄 Caricando impostazioni clipboard dal storage...');
    const settings = await loadSettings();
    console.log('📄 Impostazioni caricate:', settings);
    
    // Se useClipboard non esiste, usa il default true
    const useClipboard = settings.useClipboard !== undefined ? settings.useClipboard : true;
    console.log('✅ Settando useClipboard a:', useClipboard);
    dispatch(setUseClipboard(useClipboard));
  } catch (error) {
    console.error("Errore nel caricamento delle impostazioni", error);
    // In caso di errore, usa il default
    dispatch(setUseClipboard(true));
  }
};

// Thunk per caricare i prompt dal storage (stesso pattern dei settings)
export const loadPromptsFromStorage = () => async (dispatch: Dispatch) => {
  try {
    const prompts = await loadPrompts();
    // Importiamo setPrompts dal promptSlice
    const { setPrompts } = await import("../store/slices/promptSlice");
    dispatch(setPrompts(prompts));
  } catch (error) {
    console.error("Errore nel caricamento dei prompt", error);
  }
};

