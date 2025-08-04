// src/hooks.ts

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { updateUseClipboardAuto, updateButtonNumberClassAuto } from './slices/settingsSlice'
import { addWassa, removeWassa, updateWassa } from './slices/wassaSlice'
import type { Wassa } from '../types/Wassa'
import type { AppDispatch, RootState } from './store'

// Hook typed per dispatch e selector
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Hook per settings con persistenza automatica via middleware
export function useSettings() {
  const settings = useAppSelector((state) => state.settings)
  const dispatch = useAppDispatch()

  return {
    // Stato
    useClipboard: settings.useClipboard,
    buttonNumberClass: settings.buttonNumberClass,

    // Azioni che triggherano il middleware per il salvataggio automatico
    setUseClipboard: (value: boolean) => dispatch(updateUseClipboardAuto(value)),
    setButtonNumberClass: (value: string) => dispatch(updateButtonNumberClassAuto(value)),
  }
}

// Hook per wassas con persistenza automatica via middleware
export function useWassas() {
  const wassas = useAppSelector((state) => state.wassas.wassas)
  const dispatch = useAppDispatch()

  return {
    // Stato
    wassas,

    // Azioni che triggherano il middleware per il salvataggio automatico
    addWassa: (wassa: Wassa) => dispatch(addWassa(wassa)),
    removeWassa: (id: string) => dispatch(removeWassa(id)),
    updateWassa: (wassa: Wassa) => dispatch(updateWassa(wassa)),
  }
}

// Hook di compatibilità - mantiene l'interfaccia precedente
export function usePrompts() {
  const wassaHook = useWassas()

  return {
    // Stato - mappa wassas a prompts per compatibilità
    prompts: wassaHook.wassas,

    // Azioni che mantengono i nomi precedenti per compatibilità
    addPrompt: wassaHook.addWassa,
    removePrompt: wassaHook.removeWassa,
    updatePrompt: wassaHook.updateWassa,
  }
}
