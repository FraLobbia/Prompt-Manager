import type { Prompt } from "./Prompt"

export interface PromptSet {
  id: string
  titolo: string
  descrizione: string
  urlImage: string
  promptIds?: string[]
  prompts?: Prompt[] // Per avere i Prompt risolti vedi selectResolvedPromptSets in promptSelectors.ts
}

export const DEFAULT_PROMPT_SET_ID = "default"
export const DEFAULT_PROMPT_SET_TITLE = "Default"
export const DEFAULT_PROMPT_SET: PromptSet = {
  id: DEFAULT_PROMPT_SET_ID,
  titolo: DEFAULT_PROMPT_SET_TITLE,
  descrizione: "Questo è il set di prompt predefinito. Contiene tutti i prompt memorizzati.",
  urlImage: "",
  promptIds: [],
}
