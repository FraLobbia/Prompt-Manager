import { useState } from "react"
import SettingsPanel from "../settingsPanel/SettingsPanel"
import Header from "../common/Header"
import "./Popup.scss"
import { usePrompts } from "../store/hooks"
import Wassa from "../common/Wassa"
import EditWassa from "../common/EditWassa"
import NewWassa from "../common/NewWassa"
import type { Wassa as WassaType } from "../types/Wassa"

export default function Popup() {
  const { prompts } = usePrompts()
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  return (
    <div className="popup-container">
      <Header
        showForm={showForm}
        showSettings={showSettings}
        onShowFormChange={setShowForm}
        onShowSettingsChange={setShowSettings}
      />

      {showSettings ? (
        <SettingsPanel />
      ) : (
        <>
          {showForm && (
            <NewWassa
              showForm={showForm}
              onFormClose={() => setShowForm(false)}
            />
          )}

          <ul className="wassa-list">
            {prompts.map((p : WassaType) =>
            // Se id della wassa in editing è uguale a quello corrente
              editId === p.id ? (
                // mostra EditWassa
                <EditWassa
                  key={p.id}
                  prompt={p}
                  onEditComplete={() => setEditId(null)}
                />
              ) : (
                // Altrimenti mostra Wassa
                <Wassa
                  key={p.id}
                  prompt={p}
                  onEdit={(wassa) => setEditId(wassa.id)}
                />
              )
            )}
          </ul>
        </>
      )}
    </div>
  )
}
