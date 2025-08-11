import { useState, useMemo } from "react"
import { useSettings, useWassas, useWassaSets } from "../../store/hooks"
import Wassa from "./Wassa"
import WassaForm from "./WassaForm"
import { DEFAULT_WASSA_SET_ID } from "../../types/WassaSet"

export default function WassaList() {
  const { wassas } = useWassas()
  const { activeSet } = useSettings()
  const { wassaSets } = useWassaSets()
  const [editId, setEditId] = useState<string | null>(null)

  const activeIds = useMemo(() => {
    const set = wassaSets.find(s => s.id === activeSet)
    const ids = set?.wassasID ?? []
    return new Set(ids.map(String))
  }, [wassaSets, activeSet])

  const visible = useMemo(() => {
    if (activeSet === DEFAULT_WASSA_SET_ID) return wassas
    return wassas.filter(w => activeIds.has(String(w.id)))
  }, [wassas, activeIds, activeSet])

  // activeSet sarà sempre valorizzato (default)

  if (visible.length === 0) {
    return <p className="wassa-list__empty">Il set attivo non contiene wassà.</p>
  }

  return (
    <ul className="wassa-list">
      {visible.map(wassa =>
        editId === wassa.id ? (
          <WassaForm key={wassa.id} mode="edit" wassa={wassa} onComplete={() => setEditId(null)} />
        ) : (
          <Wassa key={wassa.id} prompt={wassa} onEdit={() => setEditId(wassa.id)} />
        )
      )}
    </ul>
  )
}
