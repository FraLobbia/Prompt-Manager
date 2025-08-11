import { useResolvedPromptSets } from "../../store/hooks"
import type { ResolvedPromptSet } from "../../store/selectors/promptSelectors"
import PromptSet from "./PromptSet.tsx"

export default function PromptSetList() {
  const { resolvedPromptSets } = useResolvedPromptSets()

  if (!resolvedPromptSets || resolvedPromptSets.length === 0) {
    return <p className="prompt-list__empty">Nessun set disponibile.</p>
  }

  return (
    <ul className="prompt-list">
      {resolvedPromptSets.map((set: ResolvedPromptSet) => (
        <PromptSet key={set.id} promptSet={set} />
      ))}
    </ul>
  )
}
