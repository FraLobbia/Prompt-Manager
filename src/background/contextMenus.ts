// src/background/contextMenus.ts

import type { Wassa } from "../types/Wassa"
import { loadWassas } from "../utils/storage"

export const setupContextMenu = async () => {
  chrome.contextMenus.removeAll()

  const wassas: Wassa[] = await loadWassas()

  chrome.contextMenus.create({
    id: "root",
    title: "Inserisci Wassa",
    contexts: ["editable"]
  })

  wassas.forEach((wassa) => {
    chrome.contextMenus.create({
      id: `wassa-${wassa.id}`,
      parentId: "root",
      title: wassa.titolo,
      contexts: ["editable"]
    })
  })

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!info.menuItemId.toString().startsWith("wassa-")) return

    const wassaId = info.menuItemId.toString().replace("wassa-", "")
    const wassa = wassas.find((w) => w.id === wassaId)
    if (!wassa) return

    chrome.tabs.sendMessage(tab!.id!, {
      action: "insertWassa",
      text: wassa.testo
    })
  })
}
