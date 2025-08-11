import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useWassas, useSettings } from "../../store/hooks"
import type { Wassa } from "../../types/Wassa"

type WassaFormProps =
  | { mode: "new"; onComplete?: () => void }
  | { mode: "edit"; wassa: Wassa; onComplete?: () => void }

export default function WassaForm(props: WassaFormProps) {
  const isEdit = props.mode === "edit"
  const wassa = isEdit ? (props as Extract<WassaFormProps, { mode: "edit" }>).wassa : undefined
  const onComplete = props.onComplete

  const { addWassa, updateWassa } = useWassas()
  const { buttonNumberClass, navigate } = useSettings()

  const [title, setTitle] = useState(isEdit ? wassa!.titolo : "")
  const [text, setText] = useState(isEdit ? wassa!.testo : "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // autoresize on mount and when content changes
    resizeTextarea()
  }, [text])

  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  const resetNew = () => {
    setTitle("")
    setText("")
    onComplete?.()
  }

  const handleSave = () => {
    const trimmedTitle = title.trim()
    const trimmedText = text.trim()
    if (!trimmedTitle || !trimmedText) return

    if (isEdit && wassa) {
      // update existing
      updateWassa({ id: wassa.id, titolo: trimmedTitle, testo: trimmedText })
      onComplete?.()
    } else {
      // create new and navigate back to active set
      addWassa({ id: Date.now().toString(), titolo: trimmedTitle, testo: trimmedText })
      resetNew()
      navigate("activeSet")
    }
  }

  // Dynamic buttons config similar to Header
  type Btn = { label: string; action: () => void }
  const buttons: Btn[] = isEdit
    ? [
        { label: "💾 Salva", action: handleSave },
        { label: "❌ Annulla", action: onComplete ?? (() => {}) },
      ]
    : [
        { label: "Salva wassa", action: handleSave },
      ]

  if (isEdit) {
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
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        />
        <div className="wassa-buttons">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className={`button-${buttonNumberClass}`}
              style={i > 0 ? { marginLeft: "0.3rem" } : undefined}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </li>
    )
  }

  // new mode
  return (
    <div className="new-wassa-form active-form">
      <h3 className="form-label">Crea un nuovo wassà</h3>

      <input
        placeholder="Titolo"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        className="input-title"
      />

      <textarea
        ref={textareaRef}
        placeholder="Testo del tuo wassà"
        value={text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        className="textarea-text"
        rows={1}
      />

      <div className="wassa-buttons">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`button-${buttonNumberClass}`}
            style={i > 0 ? { marginLeft: "0.3rem" } : undefined}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
