import type { RootState } from "../store";
import type { PromptSet } from "../../types/PromptSet";
import type { Prompt } from "../../types/Prompt";

export interface PromptSelectors {
    /**
     * Seleziona tutti i PromptSet "puri" (non risolti) dallo stato.
     * I PromptSet sono restituiti con gli id dei Prompt, non gli oggetti completi.
     * Questo è utile per ottenere i set senza risolvere i Prompt.
     * @param state - Stato globale
     * @returns {PromptSet[]} array di PromptSet "puri".
     */
    selectPromptSets: (state: RootState) => PromptSet[];
    /**
     * Seleziona tutti i PromptSet "risolti" dallo stato.
     * Risolti significa che gli id dei Prompt sono stati convertiti 
     * in oggetti prompt completi.
     * @param state - Stato globale
     * @returns {PromptSet[]} con i Prompt risolti.
     */
    selectResolvedPromptSets: (state: RootState) => PromptSet[];

    /**
     * Seleziona tutti i Prompt del set attivo dallo stato.
     * @param state - Stato globale
     * @returns  {Prompt[]} array di Prompt del set attivo.
     */
    selectPromptsOfCurrentSet: (state: RootState) => Prompt[];
}
