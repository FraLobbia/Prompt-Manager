import { useSettings, useWassas } from "../../store/hooks"
import type { Wassa } from "../../types/Wassa"

export default function Wassa({ prompt, onEdit }: WassaProps) {
  const { clipboardReplace, buttonNumberClass } = useSettings()
  const { removeWassa } = useWassas()
  const { id, titolo, testo } = prompt
  const lines = testo.split("\n")
  const anteprima = lines.slice(0, 2).join("\n")
  const hasMoreLines = lines.length > 2

  /**
   * Invia al content script un'azione di inserimento/sovrascrittura.
   * Se `clipboardReplace` è attivo, sostituisce tutte le occorrenze di "WassaTemplate"
   * con il contenuto degli appunti.
   */
  const callContentScript = async (
    action: "insert" | "overwrite",
    text: string
  ) => {
    if (clipboardReplace) {
      try {
        const clipboardText = await navigator.clipboard.readText()
        // sostituisci TUTTE le occorrenze
        text = text.replaceAll("WassaTemplate", clipboardText)
      } catch (err) {
        console.error("Errore nella lettura della clipboard:", err)
      }
    } else {
      text = text.replaceAll("WassaTemplate", " ")
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { action, text })
      }
    })
  }
  /**
   * Rimuove il wassà corrente.
   */
  const handleRemoveWassa = () => {
    if (confirm(`Vuoi davvero eliminare il wassà "${titolo}"?`)) {
      removeWassa(id)
    }
  }
  /**
   * Button configuration
   */
  const buttons: ButtonCfg[] = [
    {
      icon: "➕",
      label: "Coda",
      action: () => callContentScript("insert", testo),
      style: { marginLeft: "0" },
    },
    {
      icon: "🔄",
      label: "Sovrascrivi",
      action: () => callContentScript("overwrite", testo),
    },
    {
      icon: "✏️",
      label: "Modifica",
      action: () => onEdit?.(prompt),
    },
    {
      icon: "🗑",
      action: handleRemoveWassa,
      title: "Elimina",
      style: { maxWidth: "30px" },
    },
  ]

  return (
    <li className="wassa-item">
      <strong>{titolo}</strong>
      <div className="wassa-preview">
        {anteprima}
        {hasMoreLines ? "…" : ""}
      </div>
      <div className="wassa-buttons">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`button-${buttonNumberClass}`}
            title={btn.title}
            style={{ ...(i > 0 ? { marginLeft: "0.3rem" } : undefined), ...(btn.style ?? {}) }}
          >
            <div>{btn.icon}</div>
            {btn.label && <div>{btn.label}</div>}
          </button>
        ))}
      </div>
    </li>
  )
}

type ButtonCfg = {
  icon: string
  label?: string
  title?: string
  action: () => void
  style?: React.CSSProperties
}

interface WassaProps {
  prompt: Wassa
  onEdit?: (wassa: Wassa) => void
}
