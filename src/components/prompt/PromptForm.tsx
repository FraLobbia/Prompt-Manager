import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { usePrompts, useSettings } from "../../store/hooks"
import type { Prompt } from "../../types/Prompt"
import { getIcon, ICON_KEY } from "../../constants/icons"
import { VIEWS } from "../../constants/views"

type PromptFormProps =
  | { mode: "new"; onComplete?: () => void }
  | { mode: "edit"; prompt: Prompt; onComplete?: () => void }

export default function PromptForm(props: PromptFormProps) {
  const isEdit = props.mode === "edit"
  const prompt = isEdit ? (props as Extract<PromptFormProps, { mode: "edit" }>).prompt : undefined
  const onComplete = props.onComplete

  const { addPrompt, updatePrompt } = usePrompts()
  const { buttonNumberClass, navigate } = useSettings()

  const [title, setTitle] = useState(isEdit ? prompt!.titolo : "")
  const [text, setText] = useState(isEdit ? prompt!.testo : "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
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

    if (isEdit && prompt) {
      updatePrompt({ id: prompt.id, titolo: trimmedTitle, testo: trimmedText })
      onComplete?.()
    } else {
      addPrompt({ id: Date.now().toString(), titolo: trimmedTitle, testo: trimmedText })
      resetNew()
      navigate(VIEWS.activeSet)
    }
  }

  type Btn = { label: string; action: () => void }
  const buttons: Btn[] = isEdit
    ? [
        { label: `${getIcon(ICON_KEY.save)} Salva`, action: handleSave },
        { label: `${getIcon(ICON_KEY.close)} Annulla`, action: onComplete ?? (() => {}) },
      ]
    : [{ label: "Salva prompt", action: handleSave }]

  if (isEdit) {
    return (
      <li className="prompt-edit-item active-edit">
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
        <div className="prompt-buttons">
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

  return (
    <div className="new-prompt-form active-form">
      <h3 className="form-label">Crea un nuovo prompt</h3>

      <input
        placeholder="Titolo"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        className="input-title"
      />

      <textarea
        ref={textareaRef}
        placeholder="Testo del tuo prompt"
        value={text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        className="textarea-text"
        rows={1}
      />

      <div className="prompt-buttons">
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
