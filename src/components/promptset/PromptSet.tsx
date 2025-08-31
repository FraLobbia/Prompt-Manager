import { useCallback, useState } from "react"
import EllipsisMenu from "../common/EllipsisMenu"
import { useSettings, usePromptSets } from "../../store/hooks"
import { DEFAULT_PROMPT_SET_ID, type PromptSet } from "../../types/PromptSet"
import { VIEWS } from "../../constants/views"
import AnimatedCollapse from "../common/AnimatedCollapse.tsx"
import { copyPromptSetToClipboard, exportPromptSet } from "../../utils/utils.ts"

export default function PromptSet({ promptSet }: { promptSet: PromptSet }) {
  /** Hooks a stato globale */
  const { activeSet, navigate, setEditingSet } = useSettings()
  const { removePromptSetAndSave } = usePromptSets()

  /** Stato locale */
  const [showPrompts, setShowPrompts] = useState(false)

  /** Utility */
  const isDefaultSet = promptSet.id === DEFAULT_PROMPT_SET_ID
  const isActive = promptSet.id === activeSet
  const count = promptSet.prompts?.length ?? 0

  /**
   * Gestisce la modifica del set di prompt navigando alla vista di modifica TODO
   */
  const handleEdit = useCallback(() => {
    setEditingSet(promptSet.id)
    navigate(VIEWS.editSet)
  }, [navigate, setEditingSet, promptSet.id])

  /**
   * Gestisce la rimozione del set di prompt
   */
  const handleRemove = useCallback(() => {
    if (confirm(`Vuoi davvero eliminare il set "${promptSet.titolo}"?`)) {
      removePromptSetAndSave(promptSet.id)
    }
  }, [removePromptSetAndSave, promptSet.id, promptSet.titolo])

  return (
    <div style={{ width: "100%" }}>
      <div className="flex-column">
        <div className="flex-between">
          <h3>{promptSet.titolo}</h3>
          <div className="flex-row">
            {isActive && (
              <span
                className="prompt-set__active-flag"
                aria-label="Set attivo"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="green" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 2 }}>
                  <circle cx="8" cy="8" r="8" fill="green" />
                  <path d="M4 8l2.5 2.5L12 5" stroke="white" strokeWidth="2" fill="none" />
                </svg>
                Attivo
              </span>
            )}
            <EllipsisMenu
              buttonClassName={`btn btn--icon`}
              actions={[
                {
                  key: 'edit',
                  label: <span>Modifica</span>,
                  onClick: () => handleEdit(),
                  disabled: promptSet.id === DEFAULT_PROMPT_SET_ID
                },
                {
                  key: 'export',
                  label: <span>Esporta set</span>,
                  onClick: () => exportPromptSet(promptSet, { includePrompts: true }),
                  disabled: false
                },
                {
                  key: 'copy-json',
                  label: <span>Copia JSON del set</span>,
                  onClick: async () => {
                    const ok = await copyPromptSetToClipboard(promptSet, { includePrompts: true, pretty: true });
                    alert(ok ? 'JSON copiato negli appunti.' : 'Copia negli appunti non riuscita.');
                  },
                  disabled: false
                },
                {
                  key: 'delete',
                  label: <span>Elimina</span>,
                  onClick: () => handleRemove(),
                  disabled: isDefaultSet,
                  danger: true
                },
              ]}
            />
          </div>
        </div>

        <p className="text-muted mb-1">
          {promptSet.descrizione ?? "Nessuna descrizione"}
        </p>


        {/* Bottone toggle lista prompt (non attiva il set) */}
        {count > 0 && (
          <div>
            <button
              type="button"
              className="btn-secondary"
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
              {showPrompts ? "Comprimi" : <>Mostra<strong className="prompt-set__count">{count}</strong>prompt</>}
            </button>
          </div>
        )}
      </div>

      {/* Lista interna espandibile (prompt del set) con animazione */}
      <AnimatedCollapse open={showPrompts && count > 0}>
        <ul
          className="prompt-set__list"
          id={`prompt-set-list-${promptSet.id}`}
          aria-label={`Elenco prompt del set ${promptSet.titolo}`}
        >
          {promptSet.prompts?.map((p) => (
            <li key={String(p.id)} className="prompt-set__list-item">
              <span className="prompt-set__item-title">{p.titolo}</span>
            </li>
          ))}
        </ul>
      </AnimatedCollapse>
    </div>
  )
}