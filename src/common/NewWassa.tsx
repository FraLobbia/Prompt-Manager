import { useState, type ChangeEvent } from "react"
import { useWassas, useSettings } from "../store/hooks"

interface NewWassaFormProps {
    showForm: boolean
    onFormClose?: () => void
}

export default function NewWassaForm({
    showForm,
    onFormClose
}: NewWassaFormProps) {
    const { addWassa } = useWassas()
    const { buttonNumberClass } = useSettings()
    const [newTitle, setNewTitle] = useState("")
    const [NewWassa, setNewWassa] = useState("")

    const autoResize = (el: HTMLTextAreaElement | null) => {
        if (el) {
            el.style.height = "auto"
            el.style.height = `${el.scrollHeight}px`
        }
    }

    const handleAddWassa = () => {
        if (!newTitle.trim() || !NewWassa.trim()) return
        
        // Aggiungi wassa con Redux - il middleware salverà automaticamente
        addWassa({
            id: Date.now().toString(),
            titolo: newTitle.trim(),
            testo: NewWassa.trim()
        })
        
        // Reset form
        setNewTitle("")
        setNewWassa("")
        
        // Chiudi il form
        onFormClose?.()
    }

    return (
        <div className={`new-wassa-form ${showForm ? "active-form" : ""}`}>
            <div className="form-label">🆕 Crea nuova wassa</div>

            <input
                placeholder="Titolo"
                value={newTitle}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                className={`input-title ${showForm ? "editing" : ""}`}
            />

            <textarea
                placeholder="Testo della wassa"
                value={NewWassa}
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
