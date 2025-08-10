import { useState } from "react"
import { useWassas } from "../../store/hooks"
import Wassa from "./Wassa"
import EditWassa from "./EditWassa"

export default function WassaList() {
  const { wassas } = useWassas()
  const [editId, setEditId] = useState<string | null>(null)

  return (
    <ul className="wassa-list">
      {wassas.map((p) =>
        editId === p.id ? (
          <EditWassa key={p.id} prompt={p} onEditComplete={() => setEditId(null)} />
        ) : (
          <Wassa key={p.id} prompt={p} onEdit={(wassa) => setEditId(wassa.id)} />
        )
      )}
    </ul>
  )
}
