import { useState } from "react"
import { useAppSelector } from "../../store/hooks"
import PromptItem from "./PromptItem"
import PromptForm from "./PromptForm"
import { promptSelectors } from "../../store/selectors/promptSelectors"

export default function PromptList() {
  // Solo i Prompt del set attivo
  const prompts = useAppSelector(promptSelectors.selectPromptsOfCurrentSet);
  const [editId, setEditId] = useState<string | null>(null)

  /* ######## Vuoto ######## */
  if (prompts.length === 0) {
    return <p className="prompt-list__empty">Il set attivo non contiene prompt.</p>
  }

  /* ######## Render ######## */
  return (
    <ul className="prompt-list">
      {prompts.map(p =>
        editId === String(p.id) ? (
          <PromptForm
            key={String(p.id)}
            mode="edit"
            prompt={p}
            onComplete={() => setEditId(null)}
          />
        ) : (
          <PromptItem
            key={String(p.id)}
            prompt={p}
            onEdit={() => setEditId(String(p.id))}
          />
        )
      )}
    </ul>
  )
}
