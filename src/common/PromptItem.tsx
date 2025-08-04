
import { useSettings, usePrompts } from "../store/hooks"

interface Prompt {
  id: string
  titolo: string
  testo: string
}

interface PromptItemProps {
  prompt: Prompt
  buttonNumberClass?: string
  onEdit?: (prompt: Prompt) => void
}

export default function PromptItem({
  prompt,
  buttonNumberClass = "default",
  onEdit
}: PromptItemProps) {
  const { useClipboard } = useSettings()
  const { removePrompt } = usePrompts()
  
  const { id, titolo, testo } = prompt
  const anteprima = testo.split("\n").slice(0, 2).join("\n")
  const hasMoreLines = testo.split("\n").length > 2

  const sendPromptWithClipboard = async (
    action: "insertPrompt" | "overwritePrompt",
    text: string
  ) => {
    try {
      if (useClipboard) {
        // Sostituisci #clipboardcontent con il testo degli appunti
        const clipboardText = await navigator.clipboard.readText()
        text = text.replace(/#clipboardcontent/, clipboardText)
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action,
            text: text
          })
        }
      })
    } catch (err) {
      console.error("Errore nella lettura della clipboard:", err)
    }
  }

  const handleRemovePrompt = () => {
    const conferma = confirm(`Vuoi davvero eliminare il prompt "${titolo}"?`)
    if (!conferma) return
    removePrompt(id)
  }

  return (
    <li key={id} className="prompt-item">
      <strong>{titolo}</strong>
      <div className="prompt-preview">
        {anteprima}
        {hasMoreLines ? "…" : ""}
      </div>
      <div className="prompt-buttons">
        <button
          onClick={() => sendPromptWithClipboard("insertPrompt", testo)}
          className={`button-${buttonNumberClass}`}
        >
          <div>➕</div>
          <div>Coda</div>
        </button>

        <button
          onClick={() => sendPromptWithClipboard("overwritePrompt", testo)}
          className={`button-${buttonNumberClass}`}
          style={{ marginLeft: "0.3rem" }}
        >
          <div>🔄</div>
          <div>Sovrascrivi</div>
        </button>

        <button
          onClick={() => onEdit?.(prompt)}
          className={`button-${buttonNumberClass}`}
          style={{ marginLeft: "0.3rem" }}
        >
          <div>✏️</div>
          <div>Modifica</div>
        </button>

        <button
          onClick={handleRemovePrompt}
          className={`button-${buttonNumberClass}`}
          style={{ marginLeft: "0.3rem", maxWidth: "30px" }}
          title="Elimina"
        >
          🗑
        </button>
      </div>
    </li>
  )
}
