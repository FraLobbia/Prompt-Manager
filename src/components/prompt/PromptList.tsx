import { useState, useMemo } from "react"
import { useSettings, usePrompts, useAppSelector } from "../../store/hooks"
import PromptItem from "./PromptItem.tsx"
import PromptForm from "./PromptForm.tsx"
import { DEFAULT_PROMPT_SET_ID } from "../../types/PromptSet"
import type { Prompt } from "../../types/Prompt"

export default function PromptList() {
  const { prompts } = usePrompts()
  const { activeSet } = useSettings()
  const promptSets = useAppSelector((s) => s.promptSets?.sets ?? [])
  const [editId, setEditId] = useState<string | null>(null)

  const activeIds = useMemo(() => {
    const set = promptSets.find(s => s.id === activeSet)
    const ids = set?.promptIds ?? []
    return new Set(ids.map(String))
  }, [promptSets, activeSet])

  const visible = useMemo<Prompt[]>(() => {
    if (activeSet === DEFAULT_PROMPT_SET_ID) return prompts
    return prompts.filter((p: Prompt) => activeIds.has(String(p.id)))
  }, [prompts, activeIds, activeSet])

  if (visible.length === 0) {
    return <p className="prompt-list__empty">Il set attivo non contiene prompt.</p>
  }

  return (
    <ul className="prompt-list">
      {visible.map((p: Prompt) =>
        editId === p.id ? (
          <PromptForm key={p.id} mode="edit" prompt={p} onComplete={() => setEditId(null)} />
        ) : (
          <PromptItem key={p.id} prompt={p} onEdit={() => setEditId(p.id)} />
        )
      )}
    </ul>
  )
}
