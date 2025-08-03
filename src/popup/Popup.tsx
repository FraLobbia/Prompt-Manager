import { useEffect, useState } from "react"
import type { Prompt } from "../types/Prompt"
import { loadPrompts, savePrompts } from "../utils/storage"

export default function Popup() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [newPrompt, setNewPrompt] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editText, setEditText] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [useClipboard, setUseClipboard] = useState(false)

  useEffect(() => {
    loadPrompts().then(setPrompts)
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

  // Funzione generica per inviare il messaggio al content script, gestendo la sostituzione col contenuto clipboard
  const sendPrompt = async (action: "insertPrompt" | "overwritePrompt", text: string) => {
    console.log(`Invio azione: ${action} con testo:`, text)
    let finalText = text
    if (useClipboard && text.includes("#clipboardcontent")) {
      try {
        const clipText = await navigator.clipboard.readText()
        finalText = text.replaceAll("#clipboardcontent", clipText)
        console.log("Sostituzione placeholder con appunti:", finalText)
      } catch (err) {
        console.error("Errore nella lettura clipboard:", err)
      }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action, text: finalText })
      }
    })
  }

  return (
    <div style={{ padding: "1rem", width: "320px" }}>
      <h2>Wassà</h2>

      <label style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <input
          type="checkbox"
          checked={useClipboard}
          onChange={(e) => setUseClipboard(e.target.checked)}
          style={{ marginRight: "0.5rem" }}
        />
        Abilita inserimento appunti (#clipboardcontent)
      </label>

      <button onClick={() => setShowForm(!showForm)} style={{ width: "100%", marginBottom: "1rem" }}>
        {showForm ? "Chiudi" : "Crea nuovo"}
      </button>

      {showForm && (
        <div style={{ marginBottom: "1rem" }}>
          <input
            placeholder="Titolo"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <textarea
            placeholder="Testo del prompt"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <button onClick={addPrompt} style={{ width: "100%" }}>
            Salva prompt
          </button>
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {prompts.map((p) =>
          editId === p.id ? (
            <li key={p.id} style={{ marginBottom: "1rem" }}>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{ width: "100%", marginBottom: "0.3rem" }}
                autoFocus
              />
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{ width: "100%", marginBottom: "0.3rem" }}
              />
              <button onClick={saveEdit} style={{ marginRight: "0.5rem" }}>
                Salva
              </button>
              <button onClick={cancelEdit}>Annulla</button>
            </li>
          ) : (
            <li
              key={p.id}
              style={{
                marginBottom: "0.7rem",
                borderBottom: "1px solid #ddd",
                paddingBottom: "0.5rem"
              }}
            >
              <strong>{p.titolo}</strong>
              <div style={{ color: "#888", fontSize: "0.95em", marginTop: "0.2rem", whiteSpace: "pre-line", lineHeight: 1.3 }}>
                {p.testo.split("\n").slice(0, 2).join("\n")}
                {p.testo.split("\n").length > 2 ? "…" : ""}
              </div>
              <div style={{ marginTop: "0.3rem" }}>
                <button onClick={() => {
                  console.log("Inserimento in coda del prompt:", p.testo);
                  sendPrompt("insertPrompt", p.testo);
                }}>➕ Coda</button>

                <button onClick={() => {
                  console.log("Sovrascrittura del prompt:", p.testo);
                  sendPrompt("overwritePrompt", p.testo);
                }} style={{ marginLeft: "0.3rem" }}>
                  ✏️ Sovrascrivi
                </button>

                <button
                  onClick={() => {
                    setEditId(p.id)
                    setEditTitle(p.titolo)
                    setEditText(p.testo)
                  }}
                  style={{ marginLeft: "0.3rem" }}
                >
                  Modifica
                </button>

                <button
                  onClick={() => removePrompt(p.id)}
                  style={{ marginLeft: "0.3rem", color: "red" }}
                  title="Elimina"
                >
                  🗑
                </button>
              </div>

            </li>
          )
        )}
      </ul>
    </div>
  )
}
