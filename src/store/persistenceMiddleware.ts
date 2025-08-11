import type { Middleware } from '@reduxjs/toolkit'
import { persistPrompts, persistSettings, persistPromptSets } from '../persistence/storage'
import type { Prompt } from '../types/Prompt'
import type { Settings } from '../types/Settings'
import type { PromptSet } from '../types/PromptSet'


// Estrae l'array di Prompt indipendentemente dallo shape del slice, senza usare `any`
function getPromptsList(promptsSlice: unknown): Prompt[] {
  if (Array.isArray(promptsSlice)) {
    return promptsSlice as unknown as Prompt[]
  }
  if (typeof promptsSlice === 'object' && promptsSlice !== null) {
    const maybe = (promptsSlice as { prompts?: unknown }).prompts
    if (Array.isArray(maybe)) return maybe as Prompt[]
  }
  return []
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
  fn: (...args: A) => void,
  ms = 150
) {
  let t: ReturnType<typeof setTimeout> | undefined
  let lastArgs: A | null = null

  return (...args: A) => {
    lastArgs = args
    if (t) clearTimeout(t)
    t = setTimeout(() => {
      fn(...(lastArgs as A))
      lastArgs = null
    }, ms)
  }
}

const persistSettingsDebounced = createDebounced((settings: Settings) => {
  persistSettings(settings).catch(console.error)
})

const persistPromptsDebounced = createDebounced((list: Prompt[]) => {
  persistPrompts(list).catch(console.error)
})

const persistPromptSetsDebounced = createDebounced((sets: PromptSet[]) => {
  // usa storage.local come definito negli adapter
  persistPromptSets(sets).catch(console.error)
})

type LocalState = {
  settings: Settings
  prompts: Prompt[] | { prompts: Prompt[] }
  promptSets: PromptSet[] | { sets: PromptSet[] }
}

const persistenceMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  const prevState = store.getState() as LocalState
  const prevSettingsRef = prevState.settings
  const prevPromptsRef = prevState.prompts
  const prevPromptSetsRef = prevState.promptSets

  const result = next(action)

  const nextState = store.getState() as LocalState
  const nextSettingsRef = nextState.settings
  const nextPromptsRef = nextState.prompts
  const nextPromptSetsRef = nextState.promptSets

  // Se cambia il riferimento del slice settings, persisti tutto lo slice
  if (prevSettingsRef !== nextSettingsRef) {
    persistSettingsDebounced(nextSettingsRef)
  }

  // Se cambia il riferimento del slice prompts, persisti la lista
  if (prevPromptsRef !== nextPromptsRef) {
    const list = getPromptsList(nextPromptsRef)
    persistPromptsDebounced(list)
  }

  // Se cambia il riferimento del slice promptSets, persisti i set
  if (prevPromptSetsRef !== nextPromptSetsRef) {
    const sets = getPromptSetsList(nextPromptSetsRef)
    persistPromptSetsDebounced(sets)
  }

  return result
}

export default persistenceMiddleware
