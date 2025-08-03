// src/background/service_worker.ts
import { setupContextMenu } from "./contextMenus"

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu()
})

chrome.storage.onChanged.addListener(() => {
  setupContextMenu()
})
