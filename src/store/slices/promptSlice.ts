// src/features/prompts/promptsSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Prompt } from "../../types/Prompt"
import { savePrompts } from "../../utils/storage"
import type { AppDispatch } from "../store"

// Stato iniziale
interface PromptsState {
  prompts: Prompt[]
}

const initialState: PromptsState = {
  prompts: [],
}

const promptsSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    setPrompts(state, action: PayloadAction<Prompt[]>) {
      state.prompts = action.payload
    },
    addPrompt(state, action: PayloadAction<Prompt>) {
      state.prompts.push(action.payload)
    },
    updatePrompt(state, action: PayloadAction<Prompt>) {
      const index = state.prompts.findIndex(p => p.id === action.payload.id)
      if (index !== -1) state.prompts[index] = action.payload
    },
    removePrompt(state, action: PayloadAction<string>) {
      state.prompts = state.prompts.filter(p => p.id !== action.payload)
    }
  },
})

export const {
  setPrompts,
  addPrompt,
  updatePrompt,
  removePrompt,
} = promptsSlice.actions

// Thunk che aggiorna lo stato e salva nel storage (stesso pattern dei settings)
export const updatePrompts = (prompts: Prompt[]) => async (dispatch: AppDispatch) => {
  dispatch(setPrompts(prompts));
  try {
    await savePrompts(prompts);
  } catch (error) {
    console.error("Errore nel salvataggio dei prompt", error);
  }
};

export const addPromptAndSave = (prompt: Prompt) => async (dispatch: AppDispatch, getState: () => { prompts: PromptsState }) => {
  dispatch(addPrompt(prompt));
  try {
    const state = getState();
    await savePrompts(state.prompts.prompts);
  } catch (error) {
    console.error("Errore nel salvataggio del prompt", error);
  }
};

export default promptsSlice.reducer
