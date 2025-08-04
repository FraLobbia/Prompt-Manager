// src/features/wassas/wassasSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Wassa } from "../../types/Wassa"
import { saveWassas } from "../../persistence/storage"
import type { AppDispatch } from "../store"

// Stato iniziale
interface WassasState {
  wassas: Wassa[]
}

const initialState: WassasState = {
  wassas: [],
}

const wassasSlice = createSlice({
  name: 'wassas',
  initialState,
  reducers: {
    setWassas(state, action: PayloadAction<Wassa[]>) {
      state.wassas = action.payload
    },
    addWassa(state, action: PayloadAction<Wassa>) {
      state.wassas.push(action.payload)
    },
    updateWassa(state, action: PayloadAction<Wassa>) {
      const index = state.wassas.findIndex(w => w.id === action.payload.id)
      if (index !== -1) state.wassas[index] = action.payload
    },
    removeWassa(state, action: PayloadAction<string>) {
      state.wassas = state.wassas.filter(w => w.id !== action.payload)
    }
  },
})

export const {
  setWassas,
  addWassa,
  updateWassa,
  removeWassa,
} = wassasSlice.actions

// Thunk che aggiorna lo stato e salva nel storage (stesso pattern dei settings)
export const updateWassas = (wassas: Wassa[]) => async (dispatch: AppDispatch) => {
  dispatch(setWassas(wassas));
  try {
    await saveWassas(wassas);
  } catch (error) {
    console.error("Errore nel salvataggio delle wassas", error);
  }
};

export const addWassaAndSave = (wassa: Wassa) => async (dispatch: AppDispatch, getState: () => { wassas: WassasState }) => {
  dispatch(addWassa(wassa));
  try {
    const state = getState();
    await saveWassas(state.wassas.wassas);
  } catch (error) {
    console.error("Errore nel salvataggio della wassa", error);
  }
};

export default wassasSlice.reducer
