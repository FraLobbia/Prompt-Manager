import { useState, type ChangeEvent } from "react"
import { usePrompts } from "../store/hooks"

interface NewPromptFormProps {
    showForm: boolean
    buttonNumberClass?: string
    onFormClose?: () => void
}

export default function NewPromptForm({
    showForm,
    buttonNumberClass = "default",
    onFormClose
}: NewPromptFormProps) {
    const { addPrompt } = usePrompts()
    const [newTitle, setNewTitle] = useState("")
    const [newPrompt, setNewPrompt] = useState("")

    const autoResize = (el: HTMLTextAreaElement | null) => {
        if (el) {
            el.style.height = "auto"
            el.style.height = `${el.scrollHeight}px`
        }
    }

    const handleAddPrompt = () => {
        if (!newTitle.trim() || !newPrompt.trim()) return
        
        // Aggiungi prompt con Redux - il middleware salverà automaticamente
        addPrompt({
            id: Date.now().toString(),
            titolo: newTitle.trim(),
            testo: newPrompt.trim()
        })
        
        // Reset form
        setNewTitle("")
        setNewPrompt("")
        
        // Chiudi il form
        onFormClose?.()
    }

    return (
        <div className={`new-prompt-form ${showForm ? "active-form" : ""}`}>
            <div className="form-label">🆕 Crea nuovo prompt</div>

            <input
                placeholder="Titolo"
                value={newTitle}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                className={`input-title ${showForm ? "editing" : ""}`}
            />

            <textarea
                placeholder="Testo del prompt"
                value={newPrompt}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setNewPrompt(e.target.value)
                    autoResize(e.target)
                }}
                className="textarea-text"
                rows={1}
            />

            <button
                onClick={handleAddPrompt}
                className={`button-${buttonNumberClass}`}
            >
                Salva prompt
            </button>
        </div>
    )
}
