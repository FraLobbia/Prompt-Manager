import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ThunkAction } from "@reduxjs/toolkit"
import type { AnyAction } from "redux"
import type { RootState } from "../store"
import type { PromptSet } from "../../types/PromptSet"
import { DEFAULT_PROMPT_SET, DEFAULT_PROMPT_SET_ID } from "../../types/PromptSet"
import { persistPromptSets, loadPromptSets } from "../../persistence/storage"

interface PromptSetsState {
  sets: PromptSet[]
}

const initialState: PromptSetsState = {
  sets: [DEFAULT_PROMPT_SET],
}

const promptSetsSlice = createSlice({
  name: "promptSets",
  initialState,
  reducers: {
    setPromptSets(state, action: PayloadAction<PromptSet[]>) {
      const incoming = action.payload.map(s => ({
        ...s,
        promptIds: Array.isArray(s.promptIds) ? s.promptIds.slice() : [],
      }))
      const hasDefault = incoming.some(s => s.id === DEFAULT_PROMPT_SET_ID)
      state.sets = hasDefault ? incoming : [DEFAULT_PROMPT_SET, ...incoming]
    },
    addPromptSet(state, action: PayloadAction<PromptSet>) {
      const s = action.payload
      state.sets.push({
        ...s,
        promptIds: Array.isArray(s.promptIds) ? s.promptIds.slice() : [],
      })
    },
    updatePromptSet(state, action: PayloadAction<PromptSet>) {
      const next = {
        ...action.payload,
        promptIds: Array.isArray(action.payload.promptIds) ? action.payload.promptIds.slice() : [],
      }
      const idx = state.sets.findIndex(s => s.id === next.id)
      if (idx !== -1) state.sets[idx] = next
    },
    removePromptSet(state, action: PayloadAction<string>) {
      state.sets = state.sets.filter(s => s.id !== action.payload)
    },

    addPromptIdToSet(state, action: PayloadAction<{ setId: string; promptId: string }>) {
      const { setId, promptId } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
  const ids = set.promptIds ?? (set.promptIds = [])
  if (!ids.includes(promptId)) ids.push(promptId)
    },
    addPromptIdsToSet(state, action: PayloadAction<{ setId: string; promptIds: string[] }>) {
      const { setId, promptIds } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
  const asSet = new Set(set.promptIds ?? [])
      for (const id of promptIds) asSet.add(id)
      set.promptIds = Array.from(asSet)
    },
    replacePromptIdsInSet(state, action: PayloadAction<{ setId: string; promptIds: string[] }>) {
      const { setId, promptIds } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
      set.promptIds = promptIds.slice()
    },
    removePromptIdFromSet(state, action: PayloadAction<{ setId: string; promptId: string }>) {
      const { setId, promptId } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
  set.promptIds = (set.promptIds ?? []).filter(id => id !== promptId)
    },
    clearPromptIdsInSet(state, action: PayloadAction<string>) {
      const set = state.sets.find(s => s.id === action.payload)
      if (set) set.promptIds = []
    },
  },
})

export const {
  setPromptSets,
  addPromptSet,
  updatePromptSet,
  removePromptSet,
  addPromptIdToSet,
  addPromptIdsToSet,
  replacePromptIdsInSet,
  removePromptIdFromSet,
  clearPromptIdsInSet,
} = promptSetsSlice.actions

export default promptSetsSlice.reducer

export const hydratePromptSets = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    try {
      const sets = await loadPromptSets()
      if (Array.isArray(sets)) dispatch(setPromptSets(sets as PromptSet[]))
    } catch (err) {
      console.error("Errore nel caricamento dei PromptSet", err)
    }
  }

export const savePromptSets = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (_dispatch, getState) => {
    try {
      const { sets } = getState().promptSets
      await persistPromptSets(sets)
    } catch (err) {
      console.error("Errore nel salvataggio dei PromptSet", err)
    }
  }

export const addPromptSetAndSave = (set: PromptSet): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(addPromptSet(set))
    await dispatch(savePromptSets())
  }

export const updatePromptSetAndSave = (set: PromptSet): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(updatePromptSet(set))
    await dispatch(savePromptSets())
  }

export const removePromptSetAndSave = (setId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(removePromptSet(setId))
    await dispatch(savePromptSets())
  }

export const addPromptIdsToSetAndSave = (setId: string, promptIds: string[]): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(addPromptIdsToSet({ setId, promptIds }))
    await dispatch(savePromptSets())
  }

export const removePromptIdFromSetAndSave = (setId: string, promptId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(removePromptIdFromSet({ setId, promptId }))
    await dispatch(savePromptSets())
  }

export const replacePromptIdsInSetAndSave = (setId: string, promptIds: string[]): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(replacePromptIdsInSet({ setId, promptIds }))
    await dispatch(savePromptSets())
  }
