import { useState, type ChangeEvent } from "react"
import { useSettings, useWassaSets, useWassas } from "../../store/hooks"
import type { WassaSet } from "../../types/WassaSet"

interface WassaSetFormProps {
  onSubmit?: () => void
  /** modalità edit: se passato, inizializzo i campi e faccio update invece di add */
  editingSet?: WassaSet
}

export default function WassaSetForm({ onSubmit, editingSet }: WassaSetFormProps) {
  const { buttonNumberClass, navigate } = useSettings()
  const { addWassaSetAndSave, updateWassaSetAndSave } = useWassaSets()
  const { wassas } = useWassas() // elenco globale

  const [title, setTitle] = useState(editingSet?.titolo ?? "")
  const [description, setDescription] = useState(editingSet?.descrizione ?? "")
  const [selectedIds, setSelectedIds] = useState<string[]>(
    (editingSet?.wassasID ?? []).map(String)
  )

  const autoResize = (el: HTMLTextAreaElement | null) => {
    el?.style.setProperty("height", "auto")
    el?.style.setProperty("height", `${el.scrollHeight}px`)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSelectedIds([])
    onSubmit?.()
  }

  const handleSave = () => {
    const titolo = title.trim()
    if (!titolo) return
    const descrizione = description.trim()
    const ids = selectedIds.map(id => String(id)).filter(Boolean) 

    const set: WassaSet = {
      id: editingSet?.id ?? `set-${Date.now()}`,
      titolo,
      descrizione,
      wassasID: ids,
    }

    if (editingSet) {
      updateWassaSetAndSave(set)
    } else {
      addWassaSetAndSave(set)
    }

    resetForm()
    navigate("activeSet")
  }

  const total = wassas?.length ?? 0
  const listSize = Math.min(8, Math.max(3, total || 3))

  return (
    <div className="new-wassa-form active-form">
      <h3 className="form-label">{editingSet ? "Modifica set" : "Crea un nuovo set"}</h3>

      <input
        placeholder="Titolo del set *"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        className="input-title"
        aria-label="Titolo set"
      />

      <textarea
        placeholder="Descrizione del set (opzionale)"
        value={description}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setDescription(e.target.value)
          autoResize(e.target)
        }}
        className="textarea-text"
        rows={1}
        aria-label="Descrizione set"
      />

      <div className="divider" style={{ margin: "0.5rem 0" }} />

      <h4 className="form-subtitle">Aggiungi wassà esistenti (opzionale)</h4>

      {(!total) ? (
        <p className="hint">Non ci sono wassà salvati. Creane qualcuno e poi torna qui.</p>
      ) : (
        <div className="d-flex-column">
          <select
            id="wassa-select"
            multiple
            size={listSize}
            value={selectedIds}
            onChange={(e) => {
              const opts = Array.from(e.target.selectedOptions).map(o => o.value)
              setSelectedIds(opts)
            }}
            className="multiselect"
            aria-label="Seleziona uno o più wassà"
          >
            {wassas!.map(w => (
              <option key={String((w).id)} value={String((w).id)}>
                {(w).titolo}
              </option>
            ))}
          </select>

          <div className="multiselect-actions" style={{ marginTop: "0.5rem" }}>
            <button
              type="button"
              className={`button-${buttonNumberClass}`}
              onClick={() => setSelectedIds((wassas ?? []).map(w => String((w).id)))}
            >
              Seleziona tutti
            </button>
            <button
              type="button"
              className={`button-${buttonNumberClass}`}
              onClick={() => setSelectedIds([])}
              style={{ marginLeft: "0.5rem" }}
            >
              Deseleziona
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className={`button-${buttonNumberClass}`}
        style={{ marginTop: "0.75rem" }}
        disabled={!title.trim()}
      >
        {editingSet ? "Salva modifiche" : "Salva set"}
      </button>
    </div>
  )
}
