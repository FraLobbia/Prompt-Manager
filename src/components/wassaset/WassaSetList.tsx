import { useResolvedWassaSets } from "../../store/hooks"
import type { ResolvedWassaSet } from "../../store/selectors/wassaSelectors"
import WassaSet from "./WassaSet"

export default function WassaSetList() {
  const { resolvedWassaSets } = useResolvedWassaSets()

  if (!resolvedWassaSets || resolvedWassaSets.length === 0) {
    return <p className="wassa-list__empty">Nessun set disponibile.</p>
  }

  return (
    <ul className="wassa-list">
  {resolvedWassaSets.map((set: ResolvedWassaSet) => (
        <WassaSet key={set.id} wassaSet={set} />
      ))}
    </ul>
  )
}
