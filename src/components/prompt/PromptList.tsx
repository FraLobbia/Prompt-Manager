import { useState } from "react"
import { useAppSelector } from "../../store/hooks"
import PromptItem from "./PromptItem"
import PromptForm from "./PromptForm"
import { promptSelectors } from "../../store/selectors/promptSelectors"

export default function PromptList() {
  // Solo i Prompt del set attivo
  const prompts = useAppSelector(promptSelectors.selectPromptsOfCurrentSet);
  const [editId, setEditId] = useState<string | null>(null)

  /* ######## RENDER se non ci sono prompts ######## */
  if (prompts.length === 0) {
    return <p className="prompt-list__empty">Il set attivo non contiene prompt.</p>
  }

  /* ######## RENDER ######## */
  return (
    <ul className="prompt-list mx-3">
      {prompts.map(p => {
        const isEditing = editId === String(p.id)
        return (
          <li
            key={String(p.id)}
            className={isEditing ? "prompt-edit-item active-edit" : undefined}
          >
            {isEditing ? (
              <PromptForm mode="edit" prompt={p} onComplete={() => setEditId(null)} />
            ) : (
              <PromptItem prompt={p} onEdit={() => setEditId(String(p.id))} />
            )}
          </li>
        )
      })}
    </ul>
  )
}
