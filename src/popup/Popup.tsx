import { useState } from "react"
import SettingsPanel from "../settingsPanel/SettingsPanel"
import Header from "../common/Header"
import "./Popup.scss"
import { usePrompts } from "../store/hooks"
import PromptItem from "../common/PromptItem"
import PromptEditItem from "../common/PromptEditItem"
import NewPromptForm from "../common/NewpromptForm"
import type { Prompt } from "../types/Prompt"

export default function Popup() {
  const { prompts } = usePrompts()
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const buttonNumberClass: string = "53"

  return (
    <div className="popup-container">
      <Header
        onShowFormChange={setShowForm}
        onShowSettingsChange={setShowSettings}
      />

      {showSettings ? (
        <SettingsPanel />
      ) : (
        <>
          {showForm && (
            <NewPromptForm
              showForm={showForm}
              buttonNumberClass={buttonNumberClass}
              onFormClose={() => setShowForm(false)}
            />
          )}

          <ul className="prompt-list">
            {prompts.map((p : Prompt) =>
            // Se id del prompt in editing è uguale a quello corrente
              editId === p.id ? (
                // mostra PromptEditItem
                <PromptEditItem
                  key={p.id}
                  prompt={p}
                  buttonNumberClass={buttonNumberClass}
                  onEditComplete={() => setEditId(null)}
                />
              ) : (
                // Altrimenti mostra PromptItem
                <PromptItem
                  key={p.id}
                  prompt={p}
                  buttonNumberClass={buttonNumberClass}
                  onEdit={(prompt) => setEditId(prompt.id)}
                />
              )
            )}
          </ul>
        </>
      )}
    </div>
  )
}
