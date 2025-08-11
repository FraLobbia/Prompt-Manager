import { useSettings, useWassaSets } from "../../store/hooks"
import { DEFAULT_WASSA_SET_ID } from "../../types/WassaSet"
import type { ResolvedWassaSet } from "../../store/selectors/wassaSelectors"

export default function WassaSet({ wassaSet }: { wassaSet: ResolvedWassaSet }) {
  const { activeSet, buttonNumberClass, setActiveSet, navigate } = useSettings()
  const { removeWassaSetAndSave } = useWassaSets()

  const handleMakeActive = () => {
    setActiveSet(wassaSet.id)
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

  const isDefaultSet = wassaSet.id === DEFAULT_WASSA_SET_ID;

  type ButtonCfg = {
    label: string
    action: () => void
    disabled?: boolean
    className?: string
    title?: string
  }

  const buttons: ButtonCfg[] = [
    {
      label: wassaSet.id === activeSet ? "✅ Attivo" : "Rendi attivo",
      action: handleMakeActive,
      disabled: wassaSet.id === activeSet,
      className: wassaSet.id === activeSet ? "active" : "",
    },
    {
      label: "✏️ Modifica",
      action: handleEdit,
    },
    {
      label: "🗑",
      action: handleRemove,
      disabled: wassaSet.id === DEFAULT_WASSA_SET_ID,
      title: wassaSet.id === DEFAULT_WASSA_SET_ID ? "Non puoi eliminare il set di default" : "Elimina",
    },
  ]

  return (
    <li className="wassa-item">
      <div className="wassa-list__header">
        <strong>{wassaSet.titolo}</strong>
        {isDefaultSet ?
          <>
            <p className="muted">Set di default.</p>
            <p className="muted"> Mostra i wassà di tutti i set.</p>
          </>
          :
          <>
            <div className="muted">{wassaSet.descrizione}</div>
            <div className="muted">
              Wassà nel set: {wassaSet.wassas?.length}
            </div>
          </>
        }
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

      <div className="wassa-buttons mt-3">
        {(isDefaultSet ? [buttons[0]] : buttons).map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            disabled={btn.disabled}
            title={btn.title}
            className={`button-${buttonNumberClass} ${btn.className ?? ""}`}
            style={i > 0 ? { marginLeft: "0.3rem" } : undefined}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </li>
  )
}
