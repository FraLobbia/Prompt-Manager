import { useSettings, useWassaSets } from "../../store/hooks"
import type { WassaSet } from "../../types/WassaSet"

export default function WassaSet({wassaSet
}: {
  wassaSet: WassaSet
}) {
  const { activeSet, buttonNumberClass, setActiveSet, navigate } = useSettings()
  const { removeWassaSetAndSave } = useWassaSets()

  const handleMakeActive = () => {
    setActiveSet({ id: wassaSet.id, titolo: wassaSet.titolo, descrizione: wassaSet.descrizione, wassasID: wassaSet.wassas?.map(w => Number(w.id)) ?? [] })
    navigate("activeSet")
  }

  const handleEdit = () => {
    navigate("editSet")
  }

  const handleRemove = () => {
    if (confirm(`Vuoi davvero eliminare il set "${wassaSet.titolo}"?`)) {
      removeWassaSetAndSave(wassaSet.id)
    }
  }

  return (
    <li className="wassa-item">
      <div className="wassa-list__header">
        <strong>{wassaSet.titolo}</strong>
        {wassaSet.descrizione && <div className="muted">{wassaSet.descrizione}</div>}
        <div className="muted">Wassà nel set: {wassaSet.wassas?.length}</div>
      </div>

      {wassaSet.wassas && wassaSet.wassas.length > 0 && (
        <ul className="wassa-list__inner">
          {wassaSet.wassas.map(w => (
            <li key={String(w.id)} className="wassa-list__inner-item">
              <span className="wassa-title">{w.titolo}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="wassa-buttons" style={{ marginTop: "0.5rem" }}>
        <button
          className={`button-${buttonNumberClass} ${wassaSet.id === activeSet?.id ? "active" : ""}`}
          onClick={handleMakeActive}
          disabled={wassaSet.id === activeSet?.id}
        >
          <span>{wassaSet.id === activeSet?.id ? "Attivo" : "✅ Rendi attivo"}</span>
        </button>
        <button className={`button-${buttonNumberClass}`} onClick={handleEdit} style={{ marginLeft: "0.3rem" }}>
          <div>✏️</div>
          <div>Modifica</div>
        </button>
        <button className={`button-${buttonNumberClass}`} onClick={handleRemove} style={{ marginLeft: "0.3rem" }} title="Elimina">
          <div>🗑</div>
        </button>
      </div>
    </li>
  )
}
