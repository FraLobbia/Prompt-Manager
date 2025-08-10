import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { AppDispatch } from "../store"
import type { WassaSet } from "../../types/WassaSet"
import { persistWassaSets } from "../../persistence/storage"

// Stato
interface WassaSetsState {
  sets: WassaSet[]
}

const initialState: WassaSetsState = {
  sets: [],
}

const wassaSetsSlice = createSlice({
  name: "wassaSets",
  initialState,
  reducers: {
    setWassaSets(state, action: PayloadAction<WassaSet[]>) {
      // Garantisco l'array wassasID
      state.sets = action.payload.map(s => ({
        ...s,
        wassasID: Array.isArray(s.wassasID) ? s.wassasID.slice() : [],
      }))
    },
    addWassaSet(state, action: PayloadAction<WassaSet>) {
      const s = action.payload
      state.sets.push({
        ...s,
        wassasID: Array.isArray(s.wassasID) ? s.wassasID.slice() : [],
      })
    },
    updateWassaSet(state, action: PayloadAction<WassaSet>) {
      const next = {
        ...action.payload,
        wassasID: Array.isArray(action.payload.wassasID) ? action.payload.wassasID.slice() : [],
      }
      const idx = state.sets.findIndex(s => s.id === next.id)
      if (idx !== -1) state.sets[idx] = next
    },
    removeWassaSet(state, action: PayloadAction<string>) {
      state.sets = state.sets.filter(s => s.id !== action.payload)
    },

    // --- Operazioni sugli ID dei Wassa dentro un set ---
    addWassaIdToSet(state, action: PayloadAction<{ setId: string; wassaId: number }>) {
      const { setId, wassaId } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
      if (!set.wassasID.includes(wassaId)) set.wassasID.push(wassaId)
    },
    addWassaIdsToSet(state, action: PayloadAction<{ setId: string; wassaIds: number[] }>) {
      const { setId, wassaIds } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
      const asSet = new Set(set.wassasID)
      for (const id of wassaIds) asSet.add(id)
      set.wassasID = Array.from(asSet)
    },
    replaceWassaIdsInSet(state, action: PayloadAction<{ setId: string; wassaIds: number[] }>) {
      const { setId, wassaIds } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
      set.wassasID = wassaIds.slice()
    },
    removeWassaIdFromSet(state, action: PayloadAction<{ setId: string; wassaId: number }>) {
      const { setId, wassaId } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
      set.wassasID = set.wassasID.filter(id => id !== wassaId)
    },
    clearWassaIdsInSet(state, action: PayloadAction<string>) {
      const set = state.sets.find(s => s.id === action.payload)
      if (set) set.wassasID = []
    },
  },
})

export const {
  setWassaSets,
  addWassaSet,
  updateWassaSet,
  removeWassaSet,
  addWassaIdToSet,
  addWassaIdsToSet,
  replaceWassaIdsInSet,
  removeWassaIdFromSet,
  clearWassaIdsInSet,
} = wassaSetsSlice.actions

export default wassaSetsSlice.reducer

// ---------------- Thunk + persistenza ----------------

export const loadWassaSets = () => async (dispatch: AppDispatch) => {
  try {
    const sets = await persistWassaSets("LOAD")
    if (Array.isArray(sets)) dispatch(setWassaSets(sets as WassaSet[]))
  } catch (err) {
    console.error("Errore nel caricamento dei WassaSet", err)
  }
}

export const saveWassaSets = () => async (_dispatch: AppDispatch, getState: () => { wassaSets: WassaSetsState }) => {
  try {
    const { sets } = getState().wassaSets
    await persistWassaSets(sets)
  } catch (err) {
    console.error("Errore nel salvataggio dei WassaSet", err)
  }
}

export const addWassaSetAndSave = (set: WassaSet) => async (dispatch: AppDispatch) => {
  dispatch(addWassaSet(set))
  await dispatch(saveWassaSets())
}

export const updateWassaSetAndSave = (set: WassaSet) => async (dispatch: AppDispatch) => {
  dispatch(updateWassaSet(set))
  await dispatch(saveWassaSets())
}

export const removeWassaSetAndSave = (setId: string) => async (dispatch: AppDispatch) => {
  dispatch(removeWassaSet(setId))
  await dispatch(saveWassaSets())
}

export const addWassaIdsToSetAndSave = (setId: string, wassaIds: number[]) => async (dispatch: AppDispatch) => {
  dispatch(addWassaIdsToSet({ setId, wassaIds }))
  await dispatch(saveWassaSets())
}

export const removeWassaIdFromSetAndSave = (setId: string, wassaId: number) => async (dispatch: AppDispatch) => {
  dispatch(removeWassaIdFromSet({ setId, wassaId }))
  await dispatch(saveWassaSets())
}

export const replaceWassaIdsInSetAndSave = (setId: string, wassaIds: number[]) => async (dispatch: AppDispatch) => {
  dispatch(replaceWassaIdsInSet({ setId, wassaIds }))
  await dispatch(saveWassaSets())
}
