import { useState, type ChangeEvent } from "react"
import { useWassas, useSettings } from "../../store/hooks"

interface NewWassaFormProps {
    showForm: boolean
    onSubmit?: () => void
}

export default function NewWassaForm({ showForm, onSubmit }: NewWassaFormProps) {
    const { addWassa } = useWassas()
    const { buttonNumberClass } = useSettings()
    const [newTitle, setNewTitle] = useState("")
    const [newWassa, setNewWassa] = useState("")

    const autoResize = (el: HTMLTextAreaElement | null) => {
        el?.style.setProperty("height", "auto")
        el?.style.setProperty("height", `${el.scrollHeight}px`)
    }

    /**
     * Resetta il form
     */
    const resetForm = () => {
        setNewTitle("")
        setNewWassa("")
        // Chiude il form tramite callback
        onSubmit?.()
    }

    /**
     * Gestisce l'aggiunta di una nuova wassa.
     */
    const handleAddWassa = () => {
        const titolo = newTitle.trim()
        const testo = newWassa.trim()
        if (!titolo || !testo) return

        addWassa({
            id: Date.now().toString(),
            titolo,
            testo
        })

        resetForm()
    }

    return (
        <div className={`new-wassa-form ${showForm ? "active-form" : ""}`}>
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

            <button
                onClick={handleAddWassa}
                className={`button-${buttonNumberClass}`}
            >
                Salva wassa
            </button>
        </div>
    )
}
