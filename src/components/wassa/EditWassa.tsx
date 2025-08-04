import { useState, useRef, useEffect, type ChangeEvent } from "react"
import { useWassas, useSettings } from "../../store/hooks"
import type { Wassa } from "../../types/Wassa"

interface EditWassaProps {
  prompt: Wassa
  onEditComplete?: () => void
}

export default function EditWassa({ prompt, onEditComplete }: EditWassaProps) {
  const { updateWassa } = useWassas()
  const { buttonNumberClass } = useSettings()
  const [title, setTitle] = useState(prompt.titolo)
  const [text, setText] = useState(prompt.testo)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    resizeTextarea()
  }, [])

  const resizeTextarea = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }
  }

  const handleSave = () => {
    if (!title.trim() || !text.trim()) return
    updateWassa({ id: prompt.id, titolo: title.trim(), testo: text.trim() })
    onEditComplete?.()
  }

  return (
    <li className="wassa-edit-item active-edit">
      <input
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        className="input-title editing"
        autoFocus
      />
      <textarea
        ref={textareaRef}
        value={text}
        className="textarea-text"
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setText(e.target.value)
          resizeTextarea()
        }}
      />
      <div className="wassa-buttons">
        <button onClick={handleSave} className={`button-${buttonNumberClass}`} style={{ marginRight: "0.5rem" }}>
          💾 Salva
        </button>
        <button onClick={onEditComplete} className={`button-${buttonNumberClass}`}>
          ❌ Annulla
        </button>
      </div>
    </li>
  )
}
