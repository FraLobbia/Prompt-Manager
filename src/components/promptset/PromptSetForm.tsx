import { useState, type ChangeEvent } from "react"
import { useSettings, usePromptSets, usePrompts } from "../../store/hooks"
import type { PromptSet } from "../../types/PromptSet"

interface PromptSetFormProps {
  onSubmit?: () => void
  editingSet?: PromptSet
}

export default function PromptSetForm({ onSubmit, editingSet }: PromptSetFormProps) {
  /** Hooks a stato globale */
  const { navigate } = useSettings()
  const { addPromptSetAndSave, updatePromptSetAndSave } = usePromptSets()
  const { prompts } = usePrompts()

  /** Stato locale */
  const [title, setTitle] = useState(editingSet?.titolo ?? "")
  const [description, setDescription] = useState(editingSet?.descrizione ?? "")
  const [selectedIds, setSelectedIds] = useState<string[]>(
    (editingSet?.promptIds ?? []).map(String)
  )

  /** Utility */
  const total = prompts?.length ?? 0
  const listSize = Math.min(8, Math.max(3, total || 3))

  /**
   * Ridimensiona automaticamente l'area di testo in base al contenuto
   * @param el L'elemento textarea da ridimensionare
   */
  const autoResize = (el: HTMLTextAreaElement | null) => {
    el?.style.setProperty("height", "auto")
    el?.style.setProperty("height", `${el.scrollHeight}px`)
  }

  /**
   * Ripristina il modulo ai valori iniziali
   */
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSelectedIds([])
    onSubmit?.()
  }

  /**
   * Gestisce il salvataggio del set di prompt
   */
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

  return (
    <div className="card">
      <h3>{editingSet ? "Modifica set" : "Crea un nuovo set"}</h3>
      <input
        placeholder="Inserisci il titolo del set"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        aria-label="Titolo set"
        className="h3"
      />

      <textarea
        placeholder="Inserisci la descrizione del set (opzionale)"
        value={description}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setDescription(e.target.value)
          autoResize(e.target)
        }}
        rows={1}
        aria-label="Descrizione set"
      />

      <div className="divider"/>

      <h4 className="text-muted">Aggiungi prompt esistenti (opzionale)</h4>

      {!total ? (
        <p className="text-muted">Non ci sono prompt salvati. Creane qualcuno e poi torna qui.</p>
      ) : (
        <div className="flex-column">
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

          <div className="flex-row mt-2 gap-1">
            <button
              type="button"
              className="btn"
              onClick={() => setSelectedIds((prompts ?? []).map((p) => String(p.id)))}
            >
              Seleziona tutto
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setSelectedIds([])}
            >
              Deseleziona tutto
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="btn"
        disabled={!title.trim()}
      >
        {editingSet ? "Salva modifiche" : "Salva nuovo set"}
      </button>
    </div>
  )
}