/// <reference types="chrome" />
import type { Prompt } from "../types/Prompt"

export const savePrompts = async (prompts: Prompt[]) => {
  await chrome.storage.sync.set({ prompts })
}

export const loadPrompts = async (): Promise<Prompt[]> => {
  const result = await chrome.storage.sync.get("prompts")
  return result.prompts || []
}

export const SETTINGS_KEY = "settings"

export async function saveSettings(settings: { useClipboard: boolean }) {
  return chrome.storage.local.set({ [SETTINGS_KEY]: settings })
}

export async function loadSettings(): Promise<{ useClipboard: boolean }> {
  const result = await chrome.storage.local.get(SETTINGS_KEY)
  return result[SETTINGS_KEY] || { useClipboard: true }
}

