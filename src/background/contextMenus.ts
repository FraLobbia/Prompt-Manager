// src/background/contextMenus.ts

import type { Prompt } from "../types/Prompt"
import { loadPrompts } from "../utils/storage"

export const setupContextMenu = async () => {
  chrome.contextMenus.removeAll()

  const prompts: Prompt[] = await loadPrompts()

  chrome.contextMenus.create({
    id: "root",
    title: "Inserisci Prompt",
    contexts: ["editable"]
  })

  prompts.forEach((prompt) => {
    chrome.contextMenus.create({
      id: `prompt-${prompt.id}`,
      parentId: "root",
      title: prompt.titolo,
      contexts: ["editable"]
    })
  })

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!info.menuItemId.toString().startsWith("prompt-")) return

    const promptId = info.menuItemId.toString().replace("prompt-", "")
    const prompt = prompts.find((p) => p.id === promptId)
    if (!prompt) return

    chrome.tabs.sendMessage(tab!.id!, {
      action: "insertPrompt",
      text: prompt.testo
    })
  })
}
