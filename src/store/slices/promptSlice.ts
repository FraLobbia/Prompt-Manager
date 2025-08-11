// src/store/slices/promptSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Prompt } from "../../types/Prompt"
import type { AppDispatch } from "../store"
import { upsertPrompt, deletePrompt, migratePromptsIfNeeded } from "../../persistence/storage.prompts"

interface PromptsState {
  prompts: Prompt[]
}

const initialState: PromptsState = {
  prompts: [],
}

const promptsSlice = createSlice({
  name: "prompts",
  initialState,
  reducers: {
    setPrompts(state, action: PayloadAction<Prompt[]>) {
      // copia difensiva
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
    },
  },
})

export const {
  setPrompts,
  addPrompt,
  updatePrompt,
  removePrompt,
} = promptsSlice.actions

export default promptsSlice.reducer

/* ===========================
   Thunk helper
   =========================== */

/**
 * Sostituisce completamente i prompt in stato e li salva in storage in modo granulare.
 * Usa la stessa routine di migrazione per scrivere: indice + singoli prompt.
 * È efficiente quando devi riallineare tutto (es. import di backup).
 */
export const replaceAllPromptsAndSave = (prompts: Prompt[]) => async (dispatch: AppDispatch) => {
  dispatch(setPrompts(prompts))
  try {
    // Scrive indice + byId (chunkando solo se necessario per i singoli prompt)
    await migratePromptsIfNeeded(prompts)
  } catch (error) {
    console.error("Errore nel salvataggio totale dei prompt (granulare)", error)
  }
}

/**
 * Aggiunge un prompt e persiste solo quel prompt (no riscrittura dell’intero array).
 */
export const addPromptAndSave = (prompt: Prompt) => async (dispatch: AppDispatch) => {
  dispatch(addPrompt(prompt))
  try {
    await upsertPrompt(prompt)
  } catch (error) {
    console.error("Errore nel salvataggio del prompt", error)
  }
}

/**
 * Aggiorna un prompt e persiste solo quel prompt (no riscrittura dell’intero array).
 */
export const updatePromptAndSave = (prompt: Prompt) => async (dispatch: AppDispatch) => {
  dispatch(updatePrompt(prompt))
  try {
    await upsertPrompt(prompt)
  } catch (error) {
    console.error("Errore nell’aggiornamento del prompt", error)
  }
}

/**
 * Rimuove un prompt e lo elimina dallo storage granulare (chiave byId + indice).
 */
export const removePromptAndSave = (id: string) => async (dispatch: AppDispatch) => {
  dispatch(removePrompt(id))
  try {
    await deletePrompt(id)
  } catch (error) {
    console.error("Errore nell’eliminazione del prompt", error)
  }
}
