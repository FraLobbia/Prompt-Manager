import { useSettings, usePromptSets } from "../../store/hooks"
import { DEFAULT_PROMPT_SET_ID } from "../../types/PromptSet"
import type { ResolvedPromptSet } from "../../store/selectors/promptSelectors"

export default function PromptSet({ promptSet }: { promptSet: ResolvedPromptSet }) {
  const { activeSet, buttonNumberClass, setActiveSet, navigate } = useSettings()
  const { removePromptSetAndSave } = usePromptSets()

  const handleMakeActive = () => {
    setActiveSet(promptSet.id)
    navigate("activeSet")
  }

  const handleEdit = () => {
    navigate("editSet")
  }

  const handleRemove = () => {
    if (confirm(`Vuoi davvero eliminare il set "${promptSet.titolo}"?`)) {
      removePromptSetAndSave(promptSet.id)
    }
  }

  const isDefaultSet = promptSet.id === DEFAULT_PROMPT_SET_ID

  type ButtonCfg = {
    label: string
    action: () => void
    disabled?: boolean
    className?: string
    title?: string
  }

  const buttons: ButtonCfg[] = [
    {
      label: promptSet.id === activeSet ? "✅ Attivo" : "Rendi attivo",
      action: handleMakeActive,
      disabled: promptSet.id === activeSet,
      className: promptSet.id === activeSet ? "active" : "",
    },
    {
      label: "✏️ Modifica",
      action: handleEdit,
    },
    {
      label: "🗑",
      action: handleRemove,
      disabled: promptSet.id === DEFAULT_PROMPT_SET_ID,
      title: promptSet.id === DEFAULT_PROMPT_SET_ID ? "Non puoi eliminare il set di default" : "Elimina",
    },
  ]

  return (
    <li className="prompt-item">
      <div className="prompt-list__header">
        <strong>{promptSet.titolo}</strong>
        {isDefaultSet ? (
          <>
            <p className="muted">Set di default.</p>
            <p className="muted"> Mostra i prompt di tutti i set.</p>
          </>
        ) : (
          <>
            <div className="muted">{promptSet.descrizione}</div>
            <div className="muted">Prompt nel set: {promptSet.prompts?.length}</div>
          </>
        )}
      </div>

      {promptSet.prompts && promptSet.prompts.length > 0 && (
        <ul className="prompt-list__inner">
          {promptSet.prompts.map((p) => (
            <li key={String(p.id)} className="prompt-list__inner-item">
              <span className="prompt-title">{p.titolo}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="prompt-buttons mt-3">
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
