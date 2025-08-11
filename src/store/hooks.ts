import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"
import type { AppDispatch, RootState } from "./store"

import { setActiveSet, setView, setButtonNumberClass, setClipboardReplace } from "./slices/settingsSlice"

import { addWassa, removeWassa, updateWassa } from "./slices/wassaSlice"
import type { Wassa } from "../types/Wassa"
import type { WassaSet } from "../types/WassaSet"

import {
  addWassaSetAndSave,
  updateWassaSetAndSave,
  removeWassaSetAndSave,
  addWassaIdsToSetAndSave,
  removeWassaIdFromSetAndSave,
  replaceWassaIdsInSetAndSave,
} from "./slices/wassaSetsSlice"
import { selectResolvedWassaSets } from "./selectors/wassaSelectors"


export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// ---------------- Settings ----------------
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
  setActiveSet: (id: string | undefined) => dispatch(setActiveSet(id)),
    setClipboardReplace: (value: boolean) => dispatch(setClipboardReplace(value)),
    setButtonNumberClass: (value: string) => dispatch(setButtonNumberClass(value)),
  }
}

// ---------------- Wassa (singoli) ----------------
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

// ---------------- WassaSets (per ID) ----------------
export const useWassaSets = () => {
  const dispatch = useAppDispatch()
  const wassaSets = useAppSelector((s) => s.wassaSets?.sets ?? [])

  // Espongo sia i thunk originali *AndSave che helper comodi
  return {
    wassaSets,

    // Thunk diretti
    addWassaSetAndSave: (set: WassaSet) => dispatch(addWassaSetAndSave(set)),
    updateWassaSetAndSave: (set: WassaSet) => dispatch(updateWassaSetAndSave(set)),
    removeWassaSetAndSave: (id: string) => dispatch(removeWassaSetAndSave(id)),
  addWassaIdsToSetAndSave: (setId: string, ids: string[]) => dispatch(addWassaIdsToSetAndSave(setId, ids)),
  removeWassaIdFromSetAndSave: (setId: string, id: string) => dispatch(removeWassaIdFromSetAndSave(setId, id)),
  replaceWassaIdsInSetAndSave: (setId: string, ids: string[]) => dispatch(replaceWassaIdsInSetAndSave(setId, ids)),

    // Helper sintetici
  addWassaIdToSet: (setId: string, id: string) => dispatch(addWassaIdsToSetAndSave(setId, [id])),
  replaceWassaIdsInSet: (setId: string, ids: string[]) => dispatch(replaceWassaIdsInSetAndSave(setId, ids)),
  }
}

// Set risolti (ID -> oggetti) per il rendering
export const useResolvedWassaSets = () => {
  const sets = useSelector(selectResolvedWassaSets)
  return { resolvedWassaSets: sets }
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
