import { useCallback, useState } from "react"
import EllipsisMenu from "../common/EllipsisMenu"
import { useSettings, usePromptSets } from "../../store/hooks"
import { DEFAULT_PROMPT_SET_ID, type PromptSet } from "../../types/PromptSet"
import { VIEWS } from "../../constants/views"


export default function PromptSet({ promptSet }: { promptSet: PromptSet }) {
  /** Hooks a stato globale */
  const { activeSet, setActiveSet, navigate } = useSettings()
  const { removePromptSetAndSave } = usePromptSets()

  /** Utility */
  const isDefaultSet = promptSet.id === DEFAULT_PROMPT_SET_ID
  const isActive = promptSet.id === activeSet
  const count = promptSet.prompts?.length ?? 0
  const [showPrompts, setShowPrompts] = useState(false)

  /**
   * Rende attivo il set di prompt
   */
  const handleMakeActive = useCallback(() => {
    setActiveSet(promptSet.id)
  }, [setActiveSet, promptSet.id])

  /**
   * Gestisce la modifica del set di prompt navigando alla vista di modifica TODO
   */
  const handleEdit = useCallback(() => {
    navigate(VIEWS.editSet)
  }, [navigate])

  /**
   * Gestisce la rimozione del set di prompt
   */
  const handleRemove = useCallback(() => {
    if (confirm(`Vuoi davvero eliminare il set "${promptSet.titolo}"?`)) {
      removePromptSetAndSave(promptSet.id)
    }
  }, [removePromptSetAndSave, promptSet.id, promptSet.titolo])

  return (
    <li
      className={`m-3 prompt-set${isActive ? " prompt-set--active" : ""}${isDefaultSet ? " prompt-set--default" : ""}`}
      // opzionale: click superficie per attivare
      onClick={handleMakeActive}
      title={isActive ? "Set già attivo" : "Clic per rendere attivo"}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleMakeActive()
        }
      }}
    >
      {/* Header */}
      <div className="prompt-set__header">
        <div className="flex-between">

          <h3 className="prompt-set__title">{promptSet.titolo}</h3>

          {/* Icona 3 puntini (menù/modifica) in alto a destra */}
          <div className="d-flex-row">
            {isActive && (
              <span
                className="prompt-set__active-flag"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "green",
                  fontWeight: 500,
                  marginRight: 8,
                  fontSize: 14,
                  gap: 4,
                }}
                aria-label="Set attivo"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="green" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 2 }}>
                  <circle cx="8" cy="8" r="8" fill="green" />
                  <path d="M4 8l2.5 2.5L12 5" stroke="white" strokeWidth="2" fill="none" />
                </svg>
                Attivo
              </span>
            )}
            <div className="prompt-set__menu" style={{ position: "relative" }}>
              <EllipsisMenu
                buttonClassName={`btn btn--icon`}
                actions={[
                  { key: 'edit', label: <span style={{ marginLeft: 6 }}>Modifica</span>, onClick: () => handleEdit() },
                  { key: 'delete', label: <span style={{ marginLeft: 6 }}>Elimina</span>, onClick: () => handleRemove(), disabled: isDefaultSet },
                ]}
              />
            </div>
          </div>
        </div>

        {isDefaultSet ? (
          <div className="prompt-set__meta">
            <p className="prompt-set__line">Set di default.</p>
            <p className="prompt-set__line">
              Mostra i prompt di tutti i set <span className="prompt-set__count">({count})</span>
            </p>
          </div>
        ) : (
          <div className="prompt-set__meta">
            {promptSet.descrizione && <p className="prompt-set__line">{promptSet.descrizione}</p>}
            <p className="prompt-set__line">
              Prompt nel set: <span className="prompt-set__count">{count}</span>
            </p>
          </div>
        )}

        {/* Bottone toggle lista prompt (non attiva il set) */}
        {count > 0 && (
          <div className="prompt-set__toggle">
            <button
              type="button"
              className={`btn btn--toggle-prompts`}
              aria-expanded={showPrompts}
              aria-controls={`prompt-set-list-${promptSet.id}`}
              onClick={(e) => {
                e.stopPropagation()
                setShowPrompts(v => !v)
              }}
            >
              <svg
                className={`caret${showPrompts ? ' caret--up' : ''}`}
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden="true"
              >
                <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
              {showPrompts ? "Comprimi i prompt del set" : "Vedi i prompt del set"}
            </button>
          </div>
        )}
      </div>

      {/* Lista interna (prompt del set) */}
      {showPrompts && count > 0 && (
        <ul
          className="prompt-set__list"
          id={`prompt-set-list-${promptSet.id}`}
          aria-label={`Elenco prompt del set ${promptSet.titolo}`}
        >
          {promptSet.prompts!.map((p) => (
            <li key={String(p.id)} className="prompt-set__list-item">
              <span className="prompt-set__item-title">{p.titolo}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
