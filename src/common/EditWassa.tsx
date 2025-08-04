import { useState, useRef, useEffect, type ChangeEvent } from "react"
import { useWassas, useSettings } from "../store/hooks"
import type { Wassa } from "../types/Wassa"

interface EditWassaProps {
  prompt: Wassa
  onEditComplete?: () => void
}

export default function EditWassa({
  prompt,
  onEditComplete
}: EditWassaProps) {
  const { updateWassa } = useWassas()
  const { buttonNumberClass } = useSettings()
  const [editTitle, setEditTitle] = useState(prompt.titolo)
  const [editText, setEditText] = useState(prompt.testo)
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (editTextareaRef.current) {
      autoResize(editTextareaRef.current)
    }
  }, [])

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }
  }

  const saveEdit = () => {
    if (!editTitle.trim() || !editText.trim()) return
    updateWassa({
      id: prompt.id,
      titolo: editTitle.trim(),
      testo: editText.trim()
    })
    onEditComplete?.()
  }

  const cancelEdit = () => {
    onEditComplete?.()
  }

  return (
    <li key={prompt.id} className="wassa-edit-item active-edit">
      <input
        value={editTitle}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
        className={`input-title ${prompt.id ? "editing" : ""}`}
        autoFocus
      />
      <textarea
        ref={editTextareaRef}
        value={editText}
        className="textarea-text"
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setEditText(e.target.value)
          autoResize(e.target)
        }}
      />
      <div className="wassa-buttons">
        <button onClick={saveEdit} className={`button-${buttonNumberClass}`} style={{ marginRight: "0.5rem" }}>
          💾 Salva
        </button>
        <button onClick={cancelEdit} className={`button-${buttonNumberClass}`}>
          ❌ Annulla
        </button>
      </div>
    </li>
  )
}
