import { useState, type ChangeEvent } from "react"
import { useWassas, useSettings } from "../../store/hooks"

/**
 * Non richiede più showForm: la visibilità è governata da settings.view === "newWassa".
 * Dopo il salvataggio torna a "activeSet" tramite navigate.
 */
interface NewWassaFormProps {
  onSubmit?: () => void // opzionale per compatibilità
}

export default function NewWassaForm({ onSubmit }: NewWassaFormProps) {
  const { addWassa } = useWassas()
  const { buttonNumberClass, navigate } = useSettings()
  const [newTitle, setNewTitle] = useState("")
  const [newWassa, setNewWassa] = useState("")

  const autoResize = (el: HTMLTextAreaElement | null) => {
    el?.style.setProperty("height", "auto")
    el?.style.setProperty("height", `${el.scrollHeight}px`)
  }

  const resetForm = () => {
    setNewTitle("")
    setNewWassa("")
    onSubmit?.()
  }

  const handleAddWassa = () => {
    const titolo = newTitle.trim()
    const testo = newWassa.trim()
    if (!titolo || !testo) return

    addWassa({
      id: Date.now().toString(),
      titolo,
      testo,
    })

    resetForm()
    navigate("activeSet")
  }

  return (
    <div className="new-wassa-form active-form">
      <h3 className="form-label">Crea un nuovo wassà</h3>

      <input
        placeholder="Titolo"
        value={newTitle}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
        className="input-title"
      />

      <textarea
        placeholder="Testo del tuo wassà"
        value={newWassa}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setNewWassa(e.target.value)
          autoResize(e.target)
        }}
        className="textarea-text"
        rows={1}
      />

      <button onClick={handleAddWassa} className={`button-${buttonNumberClass}`}>
        Salva wassa
      </button>
    </div>
  )
}
