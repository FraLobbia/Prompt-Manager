import { useState, type ChangeEvent } from "react"
import { useSettings, usePromptSets, usePrompts } from "../../store/hooks"
import type { PromptSet } from "../../types/PromptSet"

interface PromptSetFormProps {
  onSubmit?: () => void
  editingSet?: PromptSet
}

export default function PromptSetForm({ onSubmit, editingSet }: PromptSetFormProps) {
  const { navigate } = useSettings()
  const { addPromptSetAndSave, updatePromptSetAndSave } = usePromptSets()
  const { prompts } = usePrompts()

  const [title, setTitle] = useState(editingSet?.titolo ?? "")
  const [description, setDescription] = useState(editingSet?.descrizione ?? "")
  const [selectedIds, setSelectedIds] = useState<string[]>(
    (editingSet?.promptIds ?? []).map(String)
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
    const ids = selectedIds.map((id) => String(id)).filter(Boolean)

    const set: PromptSet = {
      id: editingSet?.id ?? `set-${Date.now()}`,
      titolo,
      descrizione,
      promptIds: ids,
    }

    if (editingSet) {
      updatePromptSetAndSave(set)
    } else {
      addPromptSetAndSave(set)
    }

    resetForm()
    navigate("activeSet")
  }

  const total = prompts?.length ?? 0
  const listSize = Math.min(8, Math.max(3, total || 3))

  return (
    <div id="prompt-set-form" className="form-card card-like">
      <h3 className="form-label">{editingSet ? "Modifica set" : "Crea un nuovo set"}</h3>

      <input
        placeholder="Titolo del set *"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        className="input-title input-base"
        aria-label="Titolo set"
      />

      <textarea
        placeholder="Descrizione del set (opzionale)"
        value={description}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setDescription(e.target.value)
          autoResize(e.target)
        }}
        className="textarea-text textarea-base"
        rows={1}
        aria-label="Descrizione set"
      />

      <div className="divider" style={{ margin: "0.5rem 0" }} />

      <h4 className="form-subtitle">Aggiungi prompt esistenti (opzionale)</h4>

      {!total ? (
        <p className="hint">Non ci sono prompt salvati. Creane qualcuno e poi torna qui.</p>
      ) : (
        <div className="d-flex-column">
          <select
            id="prompt-select"
            multiple
            size={listSize}
            value={selectedIds}
            onChange={(e) => {
              const opts = Array.from(e.target.selectedOptions).map((o) => o.value)
              setSelectedIds(opts)
            }}
            className="multiselect"
            aria-label="Seleziona uno o più prompt"
          >
            {prompts!.map((p) => (
              <option key={String(p.id)} value={String(p.id)}>
                {p.titolo}
              </option>
            ))}
          </select>

          <div className="multiselect-actions" style={{ marginTop: "0.5rem" }}>
            <button
              type="button"
              className={`btn`}
              onClick={() => setSelectedIds((prompts ?? []).map((p) => String(p.id)))}
            >
              Seleziona tutto
            </button>
            <button
              type="button"
              className={`btn`}
              onClick={() => setSelectedIds([])}
            >
              Deseleziona tutto
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className={`btn`}
        disabled={!title.trim()}
      >
        {editingSet ? "Salva modifiche" : "Salva set"}
      </button>
    </div>
  )
}