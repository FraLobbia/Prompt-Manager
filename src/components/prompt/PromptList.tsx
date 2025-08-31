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
      <div className="card my-2">
        <h3>Il set attuale non contiene prompt.</h3>
        <button className="btn my-2"
          onClick={() => navigate(VIEWS.newPrompt)}>
          <strong>
            Crea il tuo primo prompt
          </strong>
        </button>
      </div>
    );
  }

  /* ######## RENDER ######## */
  return (
    <ul>
      {prompts.map(p => {
        return (
          <li
            key={p.id}
            className="card m-2 flex-row">
            {p.id === editId ? (
              <PromptForm mode="edit" prompt={p} onComplete={() => setEditId(null)} />
            ) : (
              <>
                <div className="flex-center gap-3">
                  <img className="prompt-list__item-image" src={p.urlImage || "/images/prompt-icon.jpeg"} alt="immagine rappresentativa del set di prompt" />
                </div>
                <PromptItem prompt={p} onEdit={() => setEditId(p.id)} />
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}
