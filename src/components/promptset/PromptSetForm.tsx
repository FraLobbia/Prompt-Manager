import { useState, useMemo, useCallback, useEffect, type ChangeEvent } from "react"
import { useSettings, usePromptSets, usePrompts } from "../../store/hooks"
import { type PromptSet } from "../../types/PromptSet"
import { VIEWS } from "../../constants/views"

interface PromptSetFormProps {
  onSubmit?: () => void
  mode?: "edit" | "new"
}

export default function PromptSetForm({ onSubmit, mode = "new" }: PromptSetFormProps) {
  /** Hooks a stato globale */
  const { navigate, editingSetId } = useSettings()
  const { promptSets, addPromptSetAndSave, updatePromptSetAndSave } = usePromptSets()
  const { prompts } = usePrompts()
  // Usa il set in modifica solo quando mode === "edit"
  const editingSet = mode === "edit" ? promptSets.find(s => s.id === editingSetId) : undefined

  /** Stato locale */
  const [title, setTitle] = useState<string>(editingSet?.titolo ?? "")
  const [description, setDescription] = useState<string>(editingSet?.descrizione ?? "")
  const [selectedIds, setSelectedIds] = useState<string[]>(
    (editingSet?.promptIds ?? []).map(String)
  )
  const [filtro, setFiltro] = useState<string>("")

  // Sincronizza i valori quando cambia la modalità o cambia il set in modifica
  useEffect(() => {
    if (mode === "edit") {
      setTitle(editingSet?.titolo ?? "")
      setDescription(editingSet?.descrizione ?? "")
      setSelectedIds((editingSet?.promptIds ?? []).map(String))
    } else {
      setTitle("")
      setDescription("")
      setSelectedIds([])
    }
  }, [mode, editingSet?.id, editingSet?.titolo, editingSet?.descrizione, editingSet?.promptIds])

  /** Utility */
  const total = prompts?.length ?? 0
  const listSize = Math.min(8, Math.max(3, total || 3))

  /** Nuovo: normalizza gli ID una volta sola (string) e tieni una lista pronta per “seleziona tutto” */
  const allPromptIds = useMemo(() => (prompts ?? []).map(p => String(p.id)), [prompts])

  /** Prompt filtrati in base alla filtro (case-insensitive, match su titolo) */
  const filteredPrompts = useMemo(() => {
    const all = prompts ?? []
    const q = filtro.trim().toLowerCase()
    if (!q) return all
    return all.filter(p => p.titolo?.toLowerCase().includes(q))
  }, [prompts, filtro])

  /** Nuovo: set di selezionati per lookup O(1) (evita includes multipli) */
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  /** */
  const isChecked = useCallback((id: string) => selectedSet.has(id), [selectedSet])

  const selectAll = useCallback(() => setSelectedIds(allPromptIds), [allPromptIds])
  const clearAll = useCallback(() => setSelectedIds([]), [])

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
  const resetForm = useCallback(() => {
    setTitle("")
    setDescription("")
    setSelectedIds([])
    onSubmit?.()
  }, [onSubmit])

  /**
   * Gestisce il salvataggio del set di prompt
   */
  const handleSave = useCallback(() => {
    const titolo = title.trim()
    if (!titolo) return
    const descrizione = description.trim()
    const ids = selectedIds.filter(Boolean)

    const set: PromptSet = {
      id: mode === "edit" && editingSet?.id ? editingSet.id : `set-${Date.now()}`,
      titolo,
      descrizione,
      promptIds: ids,
    }

    if (mode === "edit") {
      updatePromptSetAndSave(set)
    } else {
      addPromptSetAndSave(set)
    }

    resetForm()
    navigate(VIEWS.chooseSet)
  }, [title, description, selectedIds, editingSet, mode, updatePromptSetAndSave, addPromptSetAndSave, resetForm, navigate])

  /**
   * Gestisce il toggle di un ID nella lista dei selezionati
   * @param id L'ID del prompt da togglare
   * @param checked Lo stato attuale del checkbox
   */
  const toggleId = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
      if (checked) {
        if (prev.includes(id)) return prev
        return [...prev, id]
      } else {
        return prev.filter(x => x !== id)
      }
    })
  }, [])

  /** Nuovo: piccoli handler memoizzati per input */
  const onTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value), [])
  const onDescChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
    autoResize(e.target)
  }, [])
  const onFilterChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setFiltro(e.target.value), [])

  return (
    <div className="card">
      <input
        placeholder="Inserisci il titolo del set"
        value={title}
        onChange={onTitleChange}
        aria-label="Titolo set"
        className="h3"
      />

      <textarea
        placeholder="Inserisci la descrizione del set (opzionale)"
        value={description}
        onChange={onDescChange}
        rows={1}
        aria-label="Descrizione set"
      />

      <div className="divider" />

      <h4 className="text-muted">Aggiungi prompt esistenti (opzionale)</h4>

      {!total ? (
        <p className="text-muted">Non ci sono prompt salvati. Creane qualcuno e poi torna qui.</p>
      ) : (

        <div className="flex-column">
          {/* Nuovo: campo di ricerca */}
          <input
            type="text"
            className="input input--sm multiselect-filter"
            placeholder="Filtra prompt per titolo…"
            value={filtro}
            onChange={onFilterChange}
            aria-label="Filtra i prompt per titolo"
          />

          {/* Nuovo: lista checkbox al posto di <select multiple> */}
          <div
            className="multiselect-checkboxes"
            role="listbox"
            aria-multiselectable="true"
            aria-label="Seleziona uno o più prompt"
            style={{ maxHeight: `${listSize * 2.25}rem`, overflow: "auto" }}
          >
            {filteredPrompts.length === 0 ? (
              <div className="text-muted small p-1">Nessun prompt corrispondente al filtro.</div>
            ) : (
              filteredPrompts.map(p => {
                const id = String(p.id)
                const checked = isChecked(id)
                return (
                  <label
                    key={id}
                    className={`multiselect-item ${checked ? "is-selected" : ""}`}
                    role="option"
                    aria-selected={checked}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => toggleId(id, e.target.checked)}
                      className="multiselect-checkbox"
                    />
                    <span className="multiselect-item__label">{p.titolo}</span>
                  </label>
                )
              })
            )}
          </div>

          <div className="flex-row mt-2 gap-1">
            <button type="button" className="btn-secondary" onClick={selectAll}>
              Seleziona tutto
            </button>
            <button type="button" className="btn-secondary" onClick={clearAll}>
              Deseleziona tutto
            </button>
          </div>
        </div>

      )}

      {mode === "edit" && !editingSet ? (
        <div className="text-muted">Set da modificare non trovato. Torna all'elenco e riprova.</div>
      ) : (
        <button
          onClick={handleSave}
          className="btn"
          disabled={!title.trim()}
        >
          {mode === "edit" ? "Salva modifiche" : "Salva nuovo set"}
        </button>
      )}
    </div>
  )
}
