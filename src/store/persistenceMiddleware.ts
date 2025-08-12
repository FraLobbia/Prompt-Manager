// src/store/persistenceMiddleware.ts
import type { Middleware } from '@reduxjs/toolkit'
import { persistSettings, persistPromptSets } from '../persistence/storage'
import type { Prompt } from '../types/Prompt'
import type { Settings } from '../types/Settings'
import type { PromptSet } from '../types/PromptSet'
import { upsertPrompt, deletePrompt, migratePromptsIfNeeded } from '../persistence/storage.prompts'

/** ------------------------------------------------------------
 *  Utility di logging: stampa l'uso di storage.sync e storage.local
 *  ------------------------------------------------------------ */
const DEBUG_STORAGE_USAGE = true
function logAllStorageUsage() {
  if (!DEBUG_STORAGE_USAGE) return
  chrome.storage.sync.getBytesInUse(null, (bytes) => {
    console.log(`Storage.sync in uso: ${bytes} byte (${(bytes / 1024).toFixed(2)} KB)`)
  })
  chrome.storage.local.getBytesInUse(null, (bytes) => {
    console.log(`Storage.local in uso: ${bytes} byte (${(bytes / 1024).toFixed(2)} KB)`)
  })
}

// Estrae l'array di PromptSet indipendentemente dallo shape del slice
function getPromptSetsList(promptSetsSlice: unknown): PromptSet[] {
  if (Array.isArray(promptSetsSlice)) {
    return promptSetsSlice as PromptSet[]
  }
  if (typeof promptSetsSlice === 'object' && promptSetsSlice !== null) {
    const maybe = (promptSetsSlice as { sets?: unknown }).sets
    if (Array.isArray(maybe)) return maybe as PromptSet[]
  }
  return []
}

// Debounce tipata correttamente (niente any, niente errori di contravarianza)
function createDebounced<A extends unknown[]>(
  fn: (...args: A) => void | Promise<void>,
  ms = 150
) {
  let t: ReturnType<typeof setTimeout> | undefined
  let lastArgs: A | null = null

  return (...args: A) => {
    lastArgs = args
    if (t) clearTimeout(t)
    t = setTimeout(() => {
      // Supporta anche fn async
      Promise.resolve(fn(...(lastArgs as A))).finally(() => {
        lastArgs = null
      })
    }, ms)
  }
}

const persistSettingsDebounced = createDebounced((settings: Settings) => {
  return persistSettings(settings)
    .then(() => logAllStorageUsage())
    .catch(console.error)
})

// ⚠️ RIMOSSO: persistPromptsDebounced (non salviamo più l'intero array)
// Al posto suo usiamo chiamate granulari per singola azione.

const persistPromptSetsDebounced = createDebounced((sets: PromptSet[]) => {
  // usa storage.local come definito negli adapter
  return persistPromptSets(sets)
    .then(() => logAllStorageUsage())
    .catch(console.error)
})

// Helper per discriminare azioni Redux senza any
function isActionWithType(a: unknown): a is { type: string; payload?: unknown } {
  return typeof a === 'object' && a !== null && typeof (a as { type?: unknown }).type === 'string'
}

/** ------- Debounced writer granulari per i Prompt ------- */
// Evita di creare funzioni debounced ad ogni azione: le definiamo una volta sola.
const upsertPromptDebounced = createDebounced((p: Prompt) => {
  return upsertPrompt(p)
    .then(() => logAllStorageUsage())
    .catch(console.error)
}, 150)

const migratePromptsDebounced = createDebounced((list: Prompt[]) => {
  return migratePromptsIfNeeded(list)
    .then(() => logAllStorageUsage())
    .catch(console.error)
}, 200)

type LocalState = {
  settings: Settings
  prompts: Prompt[] | { prompts: Prompt[] }
  promptSets: PromptSet[] | { sets: PromptSet[] }
}

const persistenceMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  const prevState = store.getState() as LocalState
  const prevSettingsRef = prevState.settings
  const prevPromptSetsRef = prevState.promptSets
  // ⚠️ Non usiamo più il riferimento dei prompts per persistere il blob

  const result = next(action)

  const nextState = store.getState() as LocalState
  const nextSettingsRef = nextState.settings
  const nextPromptSetsRef = nextState.promptSets

  // Se cambia il riferimento del slice settings, persisti tutto lo slice
  if (prevSettingsRef !== nextSettingsRef) {
    persistSettingsDebounced(nextSettingsRef)
  }

  if (isActionWithType(action)) {
    switch (action.type) {
      // Operazioni singolo prompt → salva/aggiorna solo quell'elemento
      case 'prompts/addPrompt':
      case 'prompts/updatePrompt': {
        const p = action.payload as Prompt
        upsertPromptDebounced(p) // Debounce leggero per evitare burst di scritture durante edit rapidi
        break
      }
      // Eliminazione singolo prompt → rimuovi chiave byId e aggiorna indice
      case 'prompts/removePrompt': {
        const id = action.payload as string
        // Per delete conviene scrivere subito (senza debounce), poi loggare l’uso
        deletePrompt(id)
          .then(() => logAllStorageUsage())
          .catch(console.error)
        break
      }
      // Sostituzione completa (es. import backup) → migrazione/riscrittura indice + byId
      case 'prompts/setPrompts': {
        const list = action.payload as Prompt[]
        migratePromptsDebounced(list) // Debounce perché potrebbe arrivare in burst dopo import
        break
      }
      default:
        // no-op
        break
    }
  }

  // Se cambia il riferimento del slice promptSets, persisti i set
  if (prevPromptSetsRef !== nextPromptSetsRef) {
    const sets = getPromptSetsList(nextPromptSetsRef)
    persistPromptSetsDebounced(sets)
  }

  return result
}

export default persistenceMiddleware
