import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ThunkAction } from "@reduxjs/toolkit"
import type { AnyAction } from "redux"
import type { RootState } from "../store"
import type { WassaSet } from "../../types/WassaSet"
import { DEFAULT_WASSA_SET, DEFAULT_WASSA_SET_ID } from "../../types/WassaSet"
import { persistWassaSets, loadWassaSets } from "../../persistence/storage"

// Stato
interface WassaSetsState {
  sets: WassaSet[]
}

const initialState: WassaSetsState = {
  sets: [DEFAULT_WASSA_SET],
}

const wassaSetsSlice = createSlice({
  name: "wassaSets",
  initialState,
  reducers: {
    setWassaSets(state, action: PayloadAction<WassaSet[]>) {
      // Garantisco l'array wassasID e l'inclusione del set di default
      const incoming = action.payload.map(s => ({
        ...s,
        wassasID: Array.isArray(s.wassasID) ? s.wassasID.slice() : [],
      }))
      const hasDefault = incoming.some(s => s.id === DEFAULT_WASSA_SET_ID)
      state.sets = hasDefault ? incoming : [DEFAULT_WASSA_SET, ...incoming]
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
  addWassaIdToSet(state, action: PayloadAction<{ setId: string; wassaId: string }>) {
      const { setId, wassaId } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
      if (!set.wassasID.includes(wassaId)) set.wassasID.push(wassaId)
    },
  addWassaIdsToSet(state, action: PayloadAction<{ setId: string; wassaIds: string[] }>) {
      const { setId, wassaIds } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
      const asSet = new Set(set.wassasID)
      for (const id of wassaIds) asSet.add(id)
      set.wassasID = Array.from(asSet)
    },
  replaceWassaIdsInSet(state, action: PayloadAction<{ setId: string; wassaIds: string[] }>) {
      const { setId, wassaIds } = action.payload
      const set = state.sets.find(s => s.id === setId)
      if (!set) return
      set.wassasID = wassaIds.slice()
    },
  removeWassaIdFromSet(state, action: PayloadAction<{ setId: string; wassaId: string }>) {
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

export const hydrateWassaSets = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    try {
  const sets = await loadWassaSets()
      if (Array.isArray(sets)) dispatch(setWassaSets(sets as WassaSet[]))
    } catch (err) {
      console.error("Errore nel caricamento dei WassaSet", err)
    }
  }

export const saveWassaSets = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (_dispatch, getState) => {
    try {
      const { sets } = getState().wassaSets
      await persistWassaSets(sets)
    } catch (err) {
      console.error("Errore nel salvataggio dei WassaSet", err)
    }
  }

export const addWassaSetAndSave = (set: WassaSet): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(addWassaSet(set))
    await dispatch(saveWassaSets())
  }

export const updateWassaSetAndSave = (set: WassaSet): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(updateWassaSet(set))
    await dispatch(saveWassaSets())
  }

export const removeWassaSetAndSave = (setId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(removeWassaSet(setId))
    await dispatch(saveWassaSets())
  }

export const addWassaIdsToSetAndSave = (setId: string, wassaIds: string[]): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(addWassaIdsToSet({ setId, wassaIds }))
    await dispatch(saveWassaSets())
  }

export const removeWassaIdFromSetAndSave = (setId: string, wassaId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(removeWassaIdFromSet({ setId, wassaId }))
    await dispatch(saveWassaSets())
  }

export const replaceWassaIdsInSetAndSave = (setId: string, wassaIds: string[]): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
  async (dispatch) => {
    dispatch(replaceWassaIdsInSet({ setId, wassaIds }))
    await dispatch(saveWassaSets())
  }
