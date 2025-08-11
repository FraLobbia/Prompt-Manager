import type { Prompt } from "./Prompt"

export interface PromptSet {
  id: string
  titolo: string
  descrizione: string
  promptIds: string[]
  prompts?: Prompt[]
}

export const DEFAULT_PROMPT_SET_ID = "default"
export const DEFAULT_PROMPT_SET_TITLE = "Default"
export const DEFAULT_PROMPT_SET: PromptSet = {
  id: DEFAULT_PROMPT_SET_ID,
  titolo: DEFAULT_PROMPT_SET_TITLE,
  descrizione: "",
  promptIds: [],
}
