import { useResolvedWassaSets } from "../../store/hooks"
import type { WassaSet as WassaSetType } from "../../types/WassaSet"
import WassaSet from "./WassaSet"

export default function WassaSetList() {
  const { resolvedWassaSets } = useResolvedWassaSets()

  if (!resolvedWassaSets || resolvedWassaSets.length === 0) {
    return <p className="wassa-list__empty">Nessun set disponibile.</p>
  }

  return (
    <ul className="wassa-list">
      {resolvedWassaSets.map((set : WassaSetType) => (
        <WassaSet key={set.id} wassaSet={set} />
      ))}
    </ul>
  )
}
