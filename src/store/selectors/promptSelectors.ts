import type { PromptSelectors } from "./promptSelectors.interface";
import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import type { Prompt } from "../../types/Prompt"
import { DEFAULT_PROMPT_SET_ID, type PromptSet } from "../../types/PromptSet"


const selectAllPrompts = (state: RootState) => state.prompts.prompts
const selectAllPromptSets = (state: RootState) => state.promptSets.sets
const selectActiveSetId = (state: RootState) => state.settings.activeSet
/* ------------------------------------------------------------------
   SELECTOR MEMOIZZATO: Tutti i PromptSet "puri" (non risolti)
   Perchè serve e perchè è memoizzato?
   - Evita di ricreare l'array ad ogni render se gli input non cambiano.
   - Non risolve i Prompt, quindi è più veloce se non serve.
   - Usa createSelector per garantire che l'array sia lo stesso se non cambia.
   ------------------------------------------------------------------
   - Espone direttamente i PromptSet così come sono nello stato (con promptIds).
   - Usa createSelector solo per coerenza/memoizzazione (identità su sets).
   ------------------------------------------------------------------ */
export const selectPromptSets: (state: RootState) => PromptSet[] = createSelector(
  [selectAllPromptSets],
  (sets): PromptSet[] => sets
)


/* ------------------------------------------------------------------
   SELECTOR MEMOIZZATO: Tutti i Prompt "puri"
    Perchè serve e perchè è memoizzato?
    - Espone direttamente i Prompt così come sono nello stato (con id).
    - Usa createSelector per garantire che l'array sia lo stesso se non cambia.
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
   SELECTOR MEMOIZZATO: Tutti i PromptSet "risolti" completi di Prompt
   Perchè serve e perchè è memoizzato?
   - Risolve gli id dei Prompt in oggetti completi.
   - Usa createSelector per evitare ricreazioni inutili.
   - Se gli input non cambiano, restituisce lo stesso array di riferimento.
   ------------------------------------------------------------------
   - Combina promptSets e mappa byId per restituire set completi di Prompt.
   - Se inputs non cambiano, restituisce lo stesso array di riferimento.
   ------------------------------------------------------------------ */
export const selectResolvedPromptSets = createSelector(
  [selectAllPromptSets, selectPromptsById],
  (sets, byId): PromptSet[] => {
    return sets.map((set) => {
      // Se l'id è DEFAULT_PROMPT_SET_ID, includi tutti i prompt
      if (set.id === DEFAULT_PROMPT_SET_ID) {
        return {
          ...set,
          prompts: Array.from(byId.values()),
        };
      }
      // Altrimenti risolvi normalmente
      return {
        ...set,
        prompts: (set.promptIds ?? [])
          .map((id) => byId.get(String(id)))
          .filter((p): p is Prompt => Boolean(p)),
      };
    });
  }
);

export const selectPromptsOfCurrentSet = createSelector(
  [selectActiveSetId, selectAllPromptSets, selectPromptsById],
  (activeSetId, sets, byId): Prompt[] => {
    if (activeSetId === DEFAULT_PROMPT_SET_ID) {
      // tutti i prompt, nessun duplicato
      return Array.from(byId.values())
    }
    const current = sets.find(s => s.id === activeSetId)
    if (!current) return []
    return (current.promptIds ?? [])
      .map(id => byId.get(String(id)))
      .filter((p): p is Prompt => Boolean(p))
  }
)


// Oggetto che implementa l'interfaccia PromptSelectors
export const promptSelectors: PromptSelectors = {
  selectPromptSets,
  selectResolvedPromptSets,
  selectPromptsOfCurrentSet
};
