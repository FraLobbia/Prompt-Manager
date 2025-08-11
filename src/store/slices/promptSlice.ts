import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Prompt } from "../../types/Prompt"
import { persistPrompts } from "../../persistence/storage"
import type { AppDispatch } from "../store"

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
      state.prompts = action.payload.map(p => ({ ...p }))
    },
    addPrompt(state, action: PayloadAction<Prompt>) {
      const p = action.payload
      state.prompts.push({ ...p })
    },
    updatePrompt(state, action: PayloadAction<Prompt>) {
      const next = { ...action.payload }
      const index = state.prompts.findIndex(p => p.id === next.id)
      if (index !== -1) state.prompts[index] = next
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

export const updatePrompts = (prompts: Prompt[]) => async (dispatch: AppDispatch) => {
  dispatch(setPrompts(prompts));
  try {
    await persistPrompts(prompts);
  } catch (error) {
    console.error("Errore nel salvataggio dei prompt", error);
  }
};

export const addPromptAndSave = (prompt: Prompt) => async (dispatch: AppDispatch, getState: () => { prompts: PromptsState }) => {
  dispatch(addPrompt(prompt));
  try {
    const state = getState();
    await persistPrompts(state.prompts.prompts);
  } catch (error) {
    console.error("Errore nel salvataggio del prompt", error);
  }
};

export default promptsSlice.reducer
