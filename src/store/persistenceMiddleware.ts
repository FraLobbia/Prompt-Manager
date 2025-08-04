import type { Middleware, AnyAction } from '@reduxjs/toolkit'
import { saveWassas, saveSettings } from '../utils/storage'
import type { Wassa } from '../types/Wassa'

// Tipo per lo stato (per evitare dipendenze circolari)
interface AppState {
  wassas: {
    wassas: Wassa[] 
  }
  settings: {
    useClipboard: boolean
    buttonNumberClass: string
  }
}

// Middleware per la persistenza automatica
const persistenceMiddleware: Middleware<object, AppState> = (store) => (next) => (action: unknown) => {
  const result = next(action)
  
  // Dopo ogni azione, salva lo stato aggiornato
  const state = store.getState()
  const typedAction = action as AnyAction
  
  // Salva le wassas se sono cambiate (esclude il caricamento iniziale)
  if (typedAction.type?.startsWith('wassas/') && 
      !typedAction.type.includes('setWassas')) {
    console.log('💾 Middleware: Salvando wassas automaticamente...')
    saveWassas(state.wassas.wassas).catch(console.error)
  }
  
  // Salva le impostazioni se sono cambiate con azione auto
  if (typedAction.type === 'settings/updateUseClipboardAuto' || 
      typedAction.type === 'settings/updateButtonNumberClassAuto') {
    console.log('⚙️ Middleware: Salvando impostazioni automaticamente...')
    saveSettings({ 
      useClipboard: state.settings.useClipboard,
      buttonNumberClass: state.settings.buttonNumberClass 
    }).catch(console.error)
  }
  
  return result
}

export default persistenceMiddleware
