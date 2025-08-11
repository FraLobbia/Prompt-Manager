import { useResolvedPromptSets } from "../../store/hooks"
import type { ResolvedPromptSet } from "../../store/selectors/promptSelectors"
import PromptSet from "./PromptSet.tsx"

export default function PromptSetList() {
  /** ######## Stato globale ######## */
  const { resolvedPromptSets } = useResolvedPromptSets()

  return (
    <ul className="prompt-set-list">
      {resolvedPromptSets
        .map((set: ResolvedPromptSet) => (
          <PromptSet key={set.id} promptSet={set} />
        ))}
    </ul>
  )
}
