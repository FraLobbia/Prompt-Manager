
import { useSettings, useWassas } from "../../store/hooks"
import type { Wassa } from "../../types/Wassa"

interface WassaProps {
  prompt: Wassa
  onEdit?: (wassa: Wassa) => void
}

export default function Wassa({
  prompt,
  onEdit
}: WassaProps) {
  const { useClipboard, buttonNumberClass } = useSettings()
  const { removeWassa } = useWassas()
  
  const { id, titolo, testo } = prompt
  const anteprima = testo.split("\n").slice(0, 2).join("\n")
  const hasMoreLines = testo.split("\n").length > 2

  const sendWassaWithClipboard = async (
    action: "insertWassa" | "overwriteWassa",
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

  const handleRemoveWassa = () => {
    const conferma = confirm(`Vuoi davvero eliminare la wassa "${titolo}"?`)
    if (!conferma) return
    removeWassa(id)
  }

  return (
    <li key={id} className="wassa-item">
      <strong>{titolo}</strong>
      <div className="wassa-preview">
        {anteprima}
        {hasMoreLines ? "…" : ""}
      </div>
      <div className="wassa-buttons">
        <button
          onClick={() => sendWassaWithClipboard("insertWassa", testo)}
          className={`button-${buttonNumberClass}`}
        >
          <div>➕</div>
          <div>Coda</div>
        </button>

        <button
          onClick={() => sendWassaWithClipboard("overwriteWassa", testo)}
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
          onClick={handleRemoveWassa}
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
