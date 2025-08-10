import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { AppDispatch, RootState } from './store'
import { setActiveSet, setView, setButtonNumberClass, setClipboardReplace } from './slices/settingsSlice'
import { addWassa, removeWassa, updateWassa } from './slices/wassaSlice'
import type { Wassa } from '../types/Wassa'
import type { WassaSet } from '../types/WassaSet'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export function useSettings() {
  const settings = useAppSelector((state) => state.settings)
  const dispatch = useAppDispatch()

  return {
    // stato
    view: settings.view,
    clipboardReplace: settings.clipboardReplace,
    buttonNumberClass: settings.buttonNumberClass,
    activeSet: settings.activeSet,

    // azioni
    navigate: (v: typeof settings.view) => dispatch(setView(v)),
    setActiveSet: (s: WassaSet) => dispatch(setActiveSet(s)),

    setClipboardReplace: (value: boolean) => dispatch(setClipboardReplace(value)),
    setButtonNumberClass: (value: string) => dispatch(setButtonNumberClass(value)),
  }
}

export function useWassas() {
  const wassas = useAppSelector((state) => state.wassas.wassas)
  const dispatch = useAppDispatch()
  return {
    wassas,
    addWassa: (w: Wassa) => dispatch(addWassa(w)),
    removeWassa: (id: string) => dispatch(removeWassa(id)),
    updateWassa: (w: Wassa) => dispatch(updateWassa(w)),
  }
}

// Alias compatibilità
export function usePrompts() {
  const wassaHook = useWassas()
  return {
    prompts: wassaHook.wassas,
    addPrompt: wassaHook.addWassa,
    removePrompt: wassaHook.removeWassa,
    updatePrompt: wassaHook.updateWassa,
  }
}
