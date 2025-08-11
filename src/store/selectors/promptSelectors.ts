import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import type { Prompt } from "../../types/Prompt"
import type { PromptSet } from "../../types/PromptSet"

// Restituisce l’elenco di tutti i Prompt dal ramo "prompts" dello stato
const selectAllPrompts = (state: RootState) => state.prompts.prompts

// Restituisce l’elenco di tutti i PromptSet dal ramo "promptSets" dello stato
const selectAllPromptSets = (state: RootState) => state.promptSets.sets

/* ------------------------------------------------------------------
   SELECTOR MEMOIZZATO: Tutti i PromptSet "puri" (non risolti)
   ------------------------------------------------------------------
   - Espone direttamente i PromptSet così come sono nello stato (con promptIds).
   - Usa createSelector solo per coerenza/memoizzazione (identità su sets).
   ------------------------------------------------------------------ */
export const selectPromptSets = createSelector(
  [selectAllPromptSets],
  (sets): PromptSet[] => sets
)

/* ------------------------------------------------------------------
   SELECTOR FACTORY: Un singolo PromptSet per id (non risolto)
   ------------------------------------------------------------------ */
export const makeSelectPromptSetById = (setId: string) =>
  createSelector([selectAllPromptSets], (sets) => {
    return sets.find((s) => s.id === setId) ?? null
  })

/* ------------------------------------------------------------------
   SELECTOR MEMOIZZATO: Mappa ID -> Prompt
   ------------------------------------------------------------------
   - createSelector memoizza il risultato finché gli input non cambiano.
   - Qui evitiamo di ricreare la Map ad ogni render se i Prompt non cambiano.
   ------------------------------------------------------------------ */
const selectPromptsById = createSelector(
  [selectAllPrompts],               // Input selector: tutti i Prompt
  (prompts) => {
    // Costruisce una mappa (id come stringa -> Prompt)
    return new Map<string, Prompt>(
      prompts.map((p) => [String(p.id), p])  // String() per uniformare numeri/stringhe
    )
  }
)

/* ------------------------------------------------------------------
   SELECTOR MEMOIZZATO: Tutti i PromptSet “risolti”
   ------------------------------------------------------------------
   - Combina promptSets e mappa byId per restituire set completi di Prompt.
   - Se inputs non cambiano, restituisce lo stesso array di riferimento.
   ------------------------------------------------------------------ */
// DEPRECATO: usa selectPromptSets quando non serve risolvere i prompt.
// Manteniamo questo selector per compatibilità con codice esistente.
export const selectResolvedPromptSets = createSelector(
  [selectAllPromptSets, selectPromptsById],  // Input: array di set e mappa di prompt
  (sets, byId): PromptSet[] => {
    // Per ogni set, sostituisce gli id dei prompt con gli oggetti Prompt corrispondenti
    return sets.map((set) => ({
      // Copia id, titolo e descrizione
      id: set.id,
      titolo: set.titolo,
      descrizione: set.descrizione,

      // Risolve gli id in oggetti Prompt
      prompts: (set.promptIds ?? [])
        .map((id) => byId.get(String(id)))   // Trova Prompt corrispondente all'id
        .filter((p): p is Prompt => Boolean(p)), // Filtra quelli non trovati (p null/undefined)
    }))
  }
)

/* ------------------------------------------------------------------
   SELECTOR FACTORY: Un singolo PromptSet “risolto” per id
   ------------------------------------------------------------------
   - Restituisce un selector dedicato a un id specifico.
   - Memoizza in base all'array di ResolvedPromptSet.
   ------------------------------------------------------------------ */
// DEPRECATO: preferisci makeSelectPromptSetById se non ti servono i Prompt risolti
export const makeSelectResolvedPromptSetById = (setId: string) =>
  createSelector(
    [selectResolvedPromptSets], // Riusa il selector già memoizzato
    (resolvedSets) => {
      // Cerca il set corrispondente all'id fornito, o null se non esiste
      return resolvedSets.find((s) => s.id === setId) ?? null
    }
  )

// import type { RootState } from "../store"
// import type { Prompt } from "../../types/Prompt"
// import type { PromptSet } from "../../types/PromptSet"

// export type ResolvedPromptSet = Omit<PromptSet, "promptIds"> & { prompts: Prompt[] }

// export const selectResolvedPromptSets = (state: RootState): ResolvedPromptSet[] => {
//   const prompts = state.prompts.prompts
//   const byId = new Map<string, Prompt>(prompts.map((p: Prompt) => [String(p.id), p]))

//   return state.promptSets.sets.map(set => ({
//     id: set.id,
//     titolo: set.titolo,
//     descrizione: set.descrizione,
//     prompts: set.promptIds
//       .map((id: string) => byId.get(String(id)))
//       .filter((p): p is Prompt => Boolean(p)),
//   }))
// }
