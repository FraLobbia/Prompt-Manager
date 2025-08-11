import { useState, useMemo } from "react"                         
import { useSettings, useResolvedPromptSets, usePrompts } from "../../store/hooks" 
import PromptItem from "./PromptItem"                               
import PromptForm from "./PromptForm"                            
import type { Prompt } from "../../types/Prompt"                   // tipo del set risolto
import { DEFAULT_PROMPT_SET_ID, type PromptSet } from "../../types/PromptSet"       // id “speciale” per mostrare TUTTI i prompt

export default function PromptList() {
  /* ######## Stato globale ######## */
  const { resolvedPromptSets } = useResolvedPromptSets()            // tutti i set già con .prompts risolti
  const { activeSet } = useSettings()                               // id del set attivo (string), può essere DEFAULT_PROMPT_SET_ID
  const { prompts } = usePrompts()                                  // lista completa dei prompt (serve per il caso “tutti i prompt”)

  /* ######## Stato locale ######## */
  const [editId, setEditId] = useState<string | null>(null)         // gestisce la riga in edit inline

  /* ######## Calcolo del set attivo (se non è il “default all”) ######## */
  const activeSetObj: PromptSet | undefined = useMemo(
    () => resolvedPromptSets.find(s => s.id === activeSet),
    [resolvedPromptSets, activeSet]
  )

  /* ######## Lista visibile ########
     - Se activeSet è il “default” → mostra TUTTI i prompt
     - Altrimenti → mostra i prompt del set attivo risolto
     - Se il set non esiste o non ha prompt → array vuoto
  */
  const visible: Prompt[] = useMemo(() => {
    if (activeSet === DEFAULT_PROMPT_SET_ID) return prompts         // caso “tutti i prompt”
    return activeSetObj?.prompts ?? []                              // caso “set specifico”
  }, [activeSet, prompts, activeSetObj])

  /* ######## Vuoto ######## */
  if (visible.length === 0) {
    return <p className="prompt-list__empty">Il set attivo non contiene prompt.</p>
  }

  /* ######## Render ######## */
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
