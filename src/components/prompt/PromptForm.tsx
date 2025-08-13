import { useEffect, useMemo, useRef, useState, useCallback, type ChangeEvent } from "react"
import { usePrompts, useSettings } from "../../store/hooks"
import type { Prompt } from "../../types/Prompt"
import { getIcon, ICON_KEY } from "../../constants/icons"
import { VIEWS } from "../../constants/views"

type BaseProps = { onComplete?: () => void }
type NewProps = BaseProps & { mode: "new" }
type EditProps = BaseProps & { mode: "edit"; prompt: Prompt }
export type PromptFormProps = NewProps | EditProps

export default function PromptForm(props: PromptFormProps) {
  /** Props  */
  const isEdit = props.mode === "edit"
  const current = isEdit ? props.prompt : undefined

  /** Stato globale */
  const { addPrompt, updatePrompt } = usePrompts()
  const { navigate } = useSettings()

  /** Stato locale */
  const [title, setTitle] = useState<string>(current?.titolo ?? "")
  const [text, setText] = useState<string>(current?.testo ?? "")

  /**
   * Ridimensiona l'area di testo in base al contenuto mentre si digita
  */
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [])
  useEffect(() => { resizeTextarea() }, [text, resizeTextarea])

  /**
   * Resetta il form per un nuovo prompt
   */
  const resetNew = useCallback(() => {
    setTitle("")
    setText("")
    props.onComplete?.()
  }, [props])

  /**
   * Gestisce il salvataggio del prompt
   */
  const handleSave = useCallback(() => {
    const trimmedTitle = title.trim()
    const trimmedText = text.trim()
    if (!trimmedTitle || !trimmedText) return

    if (isEdit && current) {
      updatePrompt({ id: current.id, titolo: trimmedTitle, testo: trimmedText })
      props.onComplete?.()
    } else {
      addPrompt({ id: `${Date.now()}`, titolo: trimmedTitle, testo: trimmedText })
      resetNew()
      navigate(VIEWS.activeSet)
    }
  }, [isEdit, current, title, text, updatePrompt, addPrompt, resetNew, navigate, props])

  /**
   * Gestisce la cancellazione del prompt in modalità modifica
   */
  const handleCancel = useCallback(() => props.onComplete?.(), [props])

  type Btn = { key: string; label: string; action: () => void }
  /**
   * Bottoni disponibili
   */
  const buttons: Btn[] = useMemo(() => {
    return isEdit
      ? [
        { key: "save", label: `${getIcon(ICON_KEY.save)} Salva`, action: handleSave },
        { key: "cancel", label: `${getIcon(ICON_KEY.close)} Annulla`, action: handleCancel },
      ]
      : [
        { key: "save", label: "Salva prompt", action: handleSave },
      ]
  }, [isEdit, handleSave, handleCancel])

  return (
    <div id="prompt-form" className="form-card card-like">
      <input
        placeholder={"Inserisci il titolo"}
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        className="prompt-form__title input-base"
        autoFocus={isEdit}
        aria-label="Titolo prompt"
      />

      <textarea
        ref={textareaRef}
        placeholder={"Inserisci il testo del tuo prompt"}
        value={text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        className="prompt-form__textarea textarea-base"
        rows={1}
        aria-label="Testo prompt"
      />

      <div className="form-actions flex-center mb-2">
        {buttons.map((btn, i) => (
          <button
            key={btn.key}
            onClick={btn.action}
            className={`btn`}
            style={i > 0 ? { marginLeft: "0.3rem" } : undefined}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}