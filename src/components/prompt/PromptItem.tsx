import { useSettings, usePrompts } from "../../store/hooks"
import EllipsisMenu from "../common/EllipsisMenu"
import type { Prompt } from "../../types/Prompt"
import { getIcon, ICON_KEY } from "../../constants/icons"
type ButtonCfg = {
  icon: string
  label?: string
  title?: string
  action: () => void
  style?: React.CSSProperties
}

interface PromptItemProps {
  prompt: Prompt
  onEdit?: (prompt: Prompt) => void
}

export default function PromptItem({ prompt, onEdit }: PromptItemProps) {
  /** Hooks a stato globale */
  const { clipboardReplace } = useSettings()
  const { removePrompt } = usePrompts()

  /** Props e utility */
  const { id, titolo, testo } = prompt
  const lines = testo.split("\n")
  const anteprima = lines.slice(0, 2).join("\n")
  const hasMoreLines = lines.length > 2

  /**
   * Chiama lo script di contenuto per inserire o sovrascrivere il testo.
   */
  const callContentScript = async (
    action: "insert" | "overwrite",
    text: string
  ) => {
    if (clipboardReplace) {
      try {
        const clipboardText = await navigator.clipboard.readText()
        text = text.replaceAll("PromptTemplate", clipboardText)
          .replaceAll("PromptTemplate", clipboardText)
      } catch (err) {
        console.error("Errore nella lettura della clipboard:", err)
      }
    } else {
      text = text.replaceAll("PromptTemplate", " ")
        .replaceAll("PromptTemplate", " ")
    }
    // Manda il messaggio al content script su chrome
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { action, text })
      }
    })
  }

  /**
   * Gestisce la rimozione del prompt.
   */
  const handleRemove = () => {
    if (confirm(`Vuoi davvero eliminare il prompt "${titolo}"?`)) {
      removePrompt(id)
    }
  }

  /**
   * Configura i pulsanti per il prompt.
   */
  const primaryButtons: ButtonCfg[] = [
    { label: "Coda", icon: getIcon(ICON_KEY.add), action: () => callContentScript("insert", testo) },
    { label: "Sovrascrivi", icon: getIcon(ICON_KEY.overwrite), action: () => callContentScript("overwrite", testo) },
  ]

  /** ######### RENDER ########## */
  return (
    <div className="prompt-item-wrapper" style={{ position: "relative" }}>
      <h3 style={{ paddingRight: "2rem" }}>{titolo}</h3>
      {/* Ellipsis menu riusabile */}
      <div style={{ position: "absolute", top: 4, right: 4 }}>
        <EllipsisMenu
          actions={[
            { key: 'edit', label: <span style={{ marginLeft: 6 }}>Modifica</span>, onClick: () => onEdit?.(prompt) },
            { key: 'delete', label: <span style={{ marginLeft: 6 }}>Elimina</span>, onClick: handleRemove, danger: true },
          ]}
          buttonClassName="btn btn--icon"
          ariaLabel="Azioni prompt"
        />
      </div>

      <div className="prompt-preview">
        {anteprima}
        {hasMoreLines ? "…" : ""}
      </div>
      <div className="prompt-buttons" style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        {primaryButtons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="btn prompt-btn"
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
            title={btn.title}
          >
            <div>{btn.icon}</div>
            {btn.label && <div>{btn.label}</div>}
          </button>
        ))}
      </div>
    </div>
  )
}

