import { useSettings, useWassas } from "../../store/hooks"
import type { Wassa } from "../../types/Wassa"

interface WassaProps {
  prompt: Wassa
  onEdit?: (wassa: Wassa) => void
}

export default function Wassa({ prompt, onEdit }: WassaProps) {
  const { useClipboard, buttonNumberClass } = useSettings()
  const { removeWassa } = useWassas()

  const { id, titolo, testo } = prompt
  const lines = testo.split("\n")
  const anteprima = lines.slice(0, 2).join("\n")
  const hasMoreLines = lines.length > 2
  /**
   * Chiama lo script di contenuto per inserire o sovrascrivere il testo.
   * Se `useClipboard` è abilitato, sostituisce "WassaTemplate" con il testo degli appunti.
   */
  const callContentScript = async (
    action: "insert" | "overwrite",
    text: string
  ) => {
    if (useClipboard) {
      try {
        const clipboardText = await navigator.clipboard.readText()
        text = text.replace(/WassaTemplate/, clipboardText)
      } catch (err) {
        console.error("Errore nella lettura della clipboard:", err)
      }
    } else {
      text = text.replace(/WassaTemplate/, " ")
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { action, text })
      }
    })
  }

  const handleRemoveWassa = () => {
    if (confirm(`Vuoi davvero eliminare il wassà "${titolo}"?`)) {
      removeWassa(id)
    }
  }

  const renderButton = (
    onClick: () => void,
    icon: string,
    label?: string,
    extraStyle?: React.CSSProperties,
    title?: string
  ) => (
    <button
      onClick={onClick}
      className={`button-${buttonNumberClass}`}
      style={{ marginLeft: "0.3rem", ...extraStyle }}
      title={title}
    >
      <div>{icon}</div>
      {label && <div>{label}</div>}
    </button>
  )

  return (
    <li className="wassa-item">
      <strong>{titolo}</strong>
      <div className="wassa-preview">
        {anteprima}
        {hasMoreLines ? "…" : ""}
      </div>
      <div className="wassa-buttons">
        {renderButton(() => callContentScript("insert", testo), "➕", "Coda", { marginLeft: "0" })}
        {renderButton(() => callContentScript("overwrite", testo), "🔄", "Sovrascrivi")}
        {renderButton(() => onEdit?.(prompt), "✏️", "Modifica")}
        {renderButton(handleRemoveWassa, "🗑", undefined, { maxWidth: "30px" }, "Elimina")}
      </div>
    </li>
  )
}
