import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from './store'
import { updateUseClipboardAuto } from './slices/settingsSlice'
import { addPrompt, removePrompt, updatePrompt } from './slices/promptSlice'
import type { Prompt } from '../types/Prompt'

// Hook per settings con persistenza automatica via middleware
export function useSettings() {
  const settings = useSelector((state: RootState) => state.settings)
  const dispatch = useDispatch()

  return {
    // Stato
    useClipboard: settings.useClipboard,
    
    // Azioni che triggherano il middleware per il salvataggio automatico
    setUseClipboard: (value: boolean) => dispatch(updateUseClipboardAuto(value)),
  }
}

// Hook per prompt con persistenza automatica via middleware
export function usePrompts() {
  const prompts = useSelector((state: RootState) => state.prompts.prompts)
  const dispatch = useDispatch()

  return {
    // Stato
    prompts,
    
    // Azioni che triggherano il middleware per il salvataggio automatico
    addPrompt: (prompt: Prompt) => dispatch(addPrompt(prompt)),
    removePrompt: (id: string) => dispatch(removePrompt(id)),
    updatePrompt: (prompt: Prompt) => dispatch(updatePrompt(prompt)),
  }
}
