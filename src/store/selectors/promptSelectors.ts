import type { RootState } from "../store"
import type { Prompt } from "../../types/Prompt"
import type { PromptSet } from "../../types/PromptSet"

export type ResolvedPromptSet = Omit<PromptSet, "promptIds"> & { prompts: Prompt[] }

export const selectResolvedPromptSets = (state: RootState): ResolvedPromptSet[] => {
  const prompts = state.prompts.prompts
  const byId = new Map<string, Prompt>(prompts.map((p: Prompt) => [String(p.id), p]))

  return state.promptSets.sets.map(set => ({
    id: set.id,
    titolo: set.titolo,
    descrizione: set.descrizione,
    prompts: set.promptIds
      .map((id: string) => byId.get(String(id)))
      .filter((p): p is Prompt => Boolean(p)),
  }))
}
