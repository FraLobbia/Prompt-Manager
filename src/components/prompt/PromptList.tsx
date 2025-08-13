import { useState } from "react"
import { useAppSelector, useSettings } from "../../store/hooks"
import PromptItem from "./PromptItem"
import PromptForm from "./PromptForm"
import { promptSelectors } from "../../store/selectors/promptSelectors"
import { VIEWS } from "../../constants/views"

export default function PromptList() {
  // Solo i Prompt del set attivo
  const prompts = useAppSelector(promptSelectors.selectPromptsOfCurrentSet);
  const [editId, setEditId] = useState<string | null>(null)
  const { navigate } = useSettings()

  /* ######## RENDER se non ci sono prompts ######## */
  if (prompts.length === 0) {
    return (
      <div className="flex-center d-flex-column">
        <p>Il set attivo non contiene prompt.</p>
        <button
          onClick={() => navigate(VIEWS.chooseSet)}
          className="btn my-2"
        >
          Scegli un altro set
        </button>
      </div>
    );
  }

  /* ######## RENDER ######## */
  return (
    <ul className="card">
      {prompts.map(p => {
        const isEditing = editId === String(p.id);
        return (
          <li
            key={String(p.id)}
            className={`prompt-set__list-item${isEditing ? ' prompt-edit-item active-edit' : ''}`}
          >
            {isEditing ? (
              <PromptForm mode="edit" prompt={p} onComplete={() => setEditId(null)} />
            ) : (
              <PromptItem prompt={p} onEdit={() => setEditId(String(p.id))} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
