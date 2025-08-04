import type { Dispatch, SetStateAction } from "react"
import { usePrompts } from "../../store/hooks"
import Wassa from "./Wassa"
import type { Wassa as WassaType } from "../../types/Wassa"
import EditWassa from "./EditWassa"

interface HomeProps {
  editId: string | null
  setEditId: Dispatch<SetStateAction<string | null>>
}

export default function Home({ editId, setEditId }: HomeProps) {
  const { prompts } = usePrompts()
  return (
    <ul className="wassa-list">
      {prompts.map((p: WassaType) =>
        editId === p.id ? (
          <EditWassa
            key={p.id}
            prompt={p}
            onEditComplete={() => setEditId(null)}
          />
        ) : (
          <Wassa
            key={p.id}
            prompt={p}
            onEdit={(wassa) => setEditId(wassa.id)}
          />
        )
      )}
    </ul>
  )
}
