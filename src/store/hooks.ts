import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"
import type { AppDispatch, RootState } from "./store"

import { setActiveSet, setView, setButtonNumberClass, setClipboardReplace } from "./slices/settingsSlice"

import { addPrompt, removePrompt, updatePrompt } from "./slices/promptSlice"
import type { Prompt } from "../types/Prompt"
import type { PromptSet } from "../types/PromptSet"

import {
  addPromptSetAndSave,
  updatePromptSetAndSave,
  removePromptSetAndSave,
  addPromptIdsToSetAndSave,
  removePromptIdFromSetAndSave,
  replacePromptIdsInSetAndSave,
} from "./slices/promptSetsSlice"
import { selectResolvedPromptSets } from "./selectors/promptSelectors"


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

// ---------------- Prompts (singoli) ----------------
export function usePrompts() {
  const prompts = useAppSelector((state) => state.prompts.prompts)
  const dispatch = useAppDispatch()
  return {
    prompts,
    addPrompt: (p: Prompt) => dispatch(addPrompt(p)),
    removePrompt: (id: string) => dispatch(removePrompt(id)),
    updatePrompt: (p: Prompt) => dispatch(updatePrompt(p)),
  }
}

// ---------------- PromptSets (per ID) ----------------
export const usePromptSets = () => {
  const dispatch = useAppDispatch()
  const promptSets = useAppSelector((s) => s.promptSets?.sets ?? [])

  // Espongo sia i thunk originali *AndSave che helper comodi
  return {
  promptSets,

    // Thunk diretti
    addPromptSetAndSave: (set: PromptSet) => dispatch(addPromptSetAndSave(set)),
    updatePromptSetAndSave: (set: PromptSet) => dispatch(updatePromptSetAndSave(set)),
    removePromptSetAndSave: (id: string) => dispatch(removePromptSetAndSave(id)),
    addPromptIdsToSetAndSave: (setId: string, ids: string[]) => dispatch(addPromptIdsToSetAndSave(setId, ids)),
    removePromptIdFromSetAndSave: (setId: string, id: string) => dispatch(removePromptIdFromSetAndSave(setId, id)),
    replacePromptIdsInSetAndSave: (setId: string, ids: string[]) => dispatch(replacePromptIdsInSetAndSave(setId, ids)),

    // Helper sintetici
    addPromptIdToSet: (setId: string, id: string) => dispatch(addPromptIdsToSetAndSave(setId, [id])),
    replacePromptIdsInSet: (setId: string, ids: string[]) => dispatch(replacePromptIdsInSetAndSave(setId, ids)),
  }
}

// Set risolti (ID -> oggetti) per il rendering
export const useResolvedPromptSets = () => {
  const sets = useSelector(selectResolvedPromptSets)
  return { resolvedPromptSets: sets }
}
