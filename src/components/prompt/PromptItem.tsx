import { useSettings, usePrompts } from "../../store/hooks"
import type { Prompt } from "../../types/Prompt"

export default function PromptItem({ prompt, onEdit }: PromptItemProps) {
  const { clipboardReplace, buttonNumberClass } = useSettings()
  const { removePrompt } = usePrompts()
  const { id, titolo, testo } = prompt
  const lines = testo.split("\n")
  const anteprima = lines.slice(0, 2).join("\n")
  const hasMoreLines = lines.length > 2

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

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { action, text })
      }
    })
  }

  const handleRemove = () => {
    if (confirm(`Vuoi davvero eliminare il prompt "${titolo}"?`)) {
      removePrompt(id)
    }
  }

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
      action: handleRemove,
      title: "Elimina",
      style: { maxWidth: "30px" },
    },
  ]

  return (
    <li className="prompt-item">
      <strong>{titolo}</strong>
      <div className="prompt-preview">
        {anteprima}
        {hasMoreLines ? "…" : ""}
      </div>
      <div className="prompt-buttons">
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

interface PromptItemProps {
  prompt: Prompt
  onEdit?: (prompt: Prompt) => void
}
