/// <reference types="chrome" />
import type { Prompt } from "../types/Prompt"

export const savePrompts = async (prompts: Prompt[]) => {
  await chrome.storage.sync.set({ prompts })
}

export const loadPrompts = async (): Promise<Prompt[]> => {
  const result = await chrome.storage.sync.get("prompts")
  return result.prompts || []
}
