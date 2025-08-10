import type { Middleware } from '@reduxjs/toolkit'
import { persistWassas, persistSettings } from '../persistence/storage'
import type { Wassa } from '../types/Wassa'
import type { Settings } from '../types/Settings'


// Estrae l'array di Wassa indipendentemente dallo shape del slice, senza usare `any`
function getWassasList(wassasSlice: unknown): Wassa[] {
  if (Array.isArray(wassasSlice)) {
    return wassasSlice as Wassa[]
  }
  if (typeof wassasSlice === 'object' && wassasSlice !== null) {
    const maybe = (wassasSlice as { wassas?: unknown }).wassas
    if (Array.isArray(maybe)) return maybe as Wassa[]
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

const persistWassasDebounced = createDebounced((list: Wassa[]) => {
  persistWassas(list).catch(console.error)
})

type LocalState = {
  settings: Settings
  wassas: Wassa[] | { wassas: Wassa[] }
}

const persistenceMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  const prevState = store.getState() as LocalState
  const prevSettingsRef = prevState.settings
  const prevWassasRef = prevState.wassas

  const result = next(action)

  const nextState = store.getState() as LocalState
  const nextSettingsRef = nextState.settings
  const nextWassasRef = nextState.wassas

  // Se cambia il riferimento del slice settings, persisti tutto lo slice
  if (prevSettingsRef !== nextSettingsRef) {
    persistSettingsDebounced(nextSettingsRef)
  }

  // Se cambia il riferimento del slice wassas, persisti la lista
  if (prevWassasRef !== nextWassasRef) {
    const list = getWassasList(nextWassasRef)
    persistWassasDebounced(list)
  }

  return result
}

export default persistenceMiddleware
