import type { Middleware, AnyAction } from '@reduxjs/toolkit'
import { savePrompts, saveSettings } from '../utils/storage'
import type { Prompt } from '../types/Prompt'

// Tipo per lo stato (per evitare dipendenze circolari)
interface AppState {
  prompts: {
    prompts: Prompt[] 
  }
  settings: {
    useClipboard: boolean
  }
}

// Middleware per la persistenza automatica
const persistenceMiddleware: Middleware<object, AppState> = (store) => (next) => (action: unknown) => {
  const result = next(action)
  
  // Dopo ogni azione, salva lo stato aggiornato
  const state = store.getState()
  const typedAction = action as AnyAction
  
  // Salva i prompt se sono cambiati (esclude il caricamento iniziale)
  if (typedAction.type?.startsWith('prompts/') && 
      !typedAction.type.includes('setPrompts')) {
    console.log('💾 Middleware: Salvando prompt automaticamente...')
    savePrompts(state.prompts.prompts).catch(console.error)
  }
  
  // Salva le impostazioni se sono cambiate con azione auto
  if (typedAction.type === 'settings/updateUseClipboardAuto') {
    console.log('⚙️ Middleware: Salvando impostazioni automaticamente...')
    saveSettings({ useClipboard: state.settings.useClipboard }).catch(console.error)
  }
  
  return result
}

export default persistenceMiddleware
