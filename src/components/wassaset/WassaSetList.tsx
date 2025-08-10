import { useResolvedWassaSets } from "../../store/hooks"

export default function WassaSetList() {
  const { resolvedWassaSets } = useResolvedWassaSets()

  if (!resolvedWassaSets || resolvedWassaSets.length === 0) {
    return <p className="wassa-list__empty">Nessun set disponibile.</p>
  }

  return (
    <ul className="wassa-list">
      {resolvedWassaSets.map(set => (
        <li key={set.id} className="wassa-list__item">
          <div className="wassa-list__header">
            <strong>{set.titolo}</strong>
            {set.descrizione && <div className="muted">{set.descrizione}</div>}
            <div className="muted">Wassà nel set: {set.wassas.length}</div>
          </div>

          {set.wassas.length > 0 && (
            <ul className="wassa-list__inner">
              {set.wassas.map(w => (
                <li key={String(w.id)} className="wassa-list__inner-item">
                  <span className="wassa-title">{w.titolo}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}
