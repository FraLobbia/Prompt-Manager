import { useEffect, useMemo, useRef, useState, useCallback, type ChangeEvent } from "react"
import { usePrompts, usePromptSets, useSettings } from "../../store/hooks"
import type { Prompt } from "../../types/Prompt"
import { getIcon, ICON_KEY } from "../../constants/icons"
import { VIEWS } from "../../constants/views"
import { DEFAULT_PROMPT_SET_ID, type PromptSet } from "../../types/PromptSet"
import { useSelector } from "react-redux"
import { promptSelectors } from "../../store/selectors/promptSelectors"

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
  const { addPromptIdToSet } = usePromptSets()
  const { navigate, activeSet } = useSettings()

  /** Stato locale */
  const [title, setTitle] = useState<string>(current?.titolo ?? "")
  const [text, setText] = useState<string>(current?.testo ?? "")
  const [addToActiveSet, setAddToActiveSet] = useState<boolean>(true) // solo per nuova creazione
  const [urlImage, setUrlImage] = useState<string>(current?.urlImage ?? "")

  /** Utility */
  const set: PromptSet | undefined = useSelector(promptSelectors.selectResolvedPromptSets).find(set => set.id === activeSet);
  
  /**
   * Ridimensiona l'area di testo in base al contenuto mentre si digita
  */
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight + 5}px`
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
      updatePrompt({ id: current.id, titolo: trimmedTitle, testo: trimmedText, urlImage })
      props.onComplete?.()
    } else {
      const newId = `${Date.now()}`
      addPrompt({ id: newId, titolo: trimmedTitle, testo: trimmedText, urlImage })
      if (addToActiveSet && activeSet) {
        addPromptIdToSet(activeSet, newId)
      }
      resetNew()
      navigate(VIEWS.activeSet)
    }
  }, [isEdit, current, title, text, updatePrompt, addPrompt, resetNew, navigate, props, addToActiveSet, activeSet, addPromptIdToSet, urlImage])

  /**
   * Gestisce la cancellazione del prompt in modalità modifica
   */
  const handleCancel = useCallback(() => props.onComplete?.(), [props])

  /**
   * Configurazione buttons
  */
  type Btn = { key: string; label: string; action: () => void }
  const buttons: Btn[] = useMemo(() => {
    return isEdit
      ? [
        { key: "save", label: `${getIcon(ICON_KEY.save)} Salva`, action: handleSave },
        { key: "cancel", label: `${getIcon(ICON_KEY.close)} Annulla`, action: handleCancel },
      ]
      : [
        { key: "save", label: "Salva nuovo prompt", action: handleSave },
      ]
  }, [isEdit, handleSave, handleCancel])

  return (
    <div className={` flex-column gap-1 w-100 ${isEdit ? "" : "card"}`}>
      <div className="flex-between">
        <h2>{isEdit ? "Modifica il tuo prompt" : "Crea un nuovo prompt"}</h2>
        <div className="prompt-form__buttons">
          {buttons.map((btn) => (
            <button
              key={btn.key}
              disabled={btn.key === "save" && (!title || !text)}
              onClick={btn.action}
              className={`btn`}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <hr />


      <label htmlFor="set-title" className="form-label mt-2">Titolo</label>
      <input
        id="set-title"
        type="text"
        placeholder="Inserisci un titolo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Titolo prompt"
        className="h3"
        style={isEdit ? { marginBottom: ".75rem" } : {}}
      />
      <label htmlFor="set-text" className="form-label mt-2">Contenuto del prompt</label>
      <textarea
        ref={textareaRef} // per ridimensionamento
        placeholder={"Inserisci il contenuto del tuo prompt"}
        value={text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        rows={1}
        aria-label="Contenuto prompt"
      />

      <hr />
      <h4>Altri parametri</h4>
      {!isEdit && activeSet != DEFAULT_PROMPT_SET_ID && (
        <label className="mt-2" style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <input
            type="checkbox"
            checked={addToActiveSet}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAddToActiveSet(e.target.checked)}
          />
          <span>Aggiungi al set corrente: <strong>{set?.titolo}</strong></span>
        </label>
      )}

      <div>
        <label htmlFor="set-image-url" className="form-label mt-2">URL immagine del prompt (opzionale)
        </label>
      </div>
      <small className="text-muted">Se non specificata verrà usata quella di default</small>
      <input
        id="set-image-url"
        type="text"
        placeholder="Inserisci l'URL dell'immagine del prompt (opzionale)"
        value={urlImage}
        onChange={(e) => setUrlImage(e.target.value)}
        aria-label="URL immagine del prompt"
        className="input"
      />


    </div>
  )
}