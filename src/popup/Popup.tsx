import { useEffect, useState } from "react"
import type { Prompt } from "../types/Prompt"
import { loadPrompts, savePrompts, loadSettings } from "../utils/storage"
import SettingsPanel from "../settingsPanel/SettingsPanel"
import Header from "../common/Header"
import "./Popup.scss"

export default function Popup() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [newPrompt, setNewPrompt] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editText, setEditText] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [useClipboard, setUseClipboard] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadSettings().then((s) => {
      if (s?.useClipboard !== undefined) setUseClipboard(s.useClipboard)
    })

    loadPrompts().then(setPrompts)

    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      if (area === "sync" && changes.useClipboard) {
        setUseClipboard(changes.useClipboard.newValue)
      }
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const saveEdit = () => {
    if (!editTitle.trim() || !editText.trim()) return
    const updated = prompts.map((p) =>
      p.id === editId ? { ...p, titolo: editTitle.trim(), testo: editText.trim() } : p
    )
    setPrompts(updated)
    savePrompts(updated)
    cancelEdit()
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditTitle("")
    setEditText("")
  }

  const addPrompt = () => {
    if (!newTitle.trim() || !newPrompt.trim()) return
    const updated = [
      ...prompts,
      { id: Date.now().toString(), titolo: newTitle.trim(), testo: newPrompt.trim() }
    ]
    setPrompts(updated)
    savePrompts(updated)
    setNewPrompt("")
    setNewTitle("")
    setShowForm(false)
  }

  const removePrompt = (id: string) => {
    const updated = prompts.filter((p) => p.id !== id)
    setPrompts(updated)
    savePrompts(updated)
    if (editId === id) cancelEdit()
  }

  const sendPromptWithClipboard = async (action: "insertPrompt" | "overwritePrompt", text: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action,
          text,
          useClipboard
        })
      }
    })
  }

  return (
    <div className="popup-container">
      <Header
        onToggleForm={() => setShowForm(!showForm)}
        showForm={showForm}
        onToggleSettings={() => setShowSettings(!showSettings)}
        showSettings={showSettings}
      />

      {showSettings ? (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          useClipboard={useClipboard}
          setUseClipboard={setUseClipboard}
        />
      ) : (
        <>
          {showForm && (
            <div className="new-prompt-form">
              <input
                placeholder="Titolo"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="input-title"
              />
              <textarea
                placeholder="Testo del prompt"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                className="textarea-text"
              />
              <button onClick={addPrompt} className="btn-save-prompt">
                Salva prompt
              </button>
            </div>
          )}

          <ul className="prompt-list">
            {prompts.map((p) =>
              editId === p.id ? (
                <li key={p.id} className="prompt-edit-item">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input-title"
                    autoFocus
                  />
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="textarea-text"
                  />
                  <button onClick={saveEdit} className="btn-save-edit" style={{ marginRight: "0.5rem" }}>
                    Salva
                  </button>
                  <button onClick={cancelEdit} className="btn-cancel-edit">
                    Annulla
                  </button>
                </li>
              ) : (
                <li key={p.id} className="prompt-item">
                  <strong>{p.titolo}</strong>
                  <div className="prompt-preview">
                    {p.testo.split("\n").slice(0, 2).join("\n")}
                    {p.testo.split("\n").length > 2 ? "…" : ""}
                  </div>
                  <div className="prompt-buttons">
                    <button onClick={() => sendPromptWithClipboard("insertPrompt", p.testo)} className="btn-prompt-action">
                      <div>➕</div>
                      <div>Coda</div>
                    </button>
                    <button onClick={() => sendPromptWithClipboard("overwritePrompt", p.testo)} className="btn-prompt-action" style={{ marginLeft: "0.3rem" }}>
                      <div>🔄</div>
                      <div>Sovrascrivi</div>
                    </button>
                    <button
                      onClick={() => {
                        setEditId(p.id)
                        setEditTitle(p.titolo)
                        setEditText(p.testo)
                      }}
                      className="btn-prompt-action"
                      style={{ marginLeft: "0.3rem" }}
                    >
                      <div>✏️</div>
                      <div>Modifica</div>
                    </button>
                    <button
                      onClick={() => removePrompt(p.id)}
                      className="btn-delete"
                      style={{ marginLeft: "0.3rem" }}
                      title="Elimina"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        </>
      )}
    </div>
  )
}
