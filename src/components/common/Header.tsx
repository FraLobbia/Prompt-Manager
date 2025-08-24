import { useSettings } from "../../store/hooks"
import { getIcon, ICON_KEY } from "../../constants/icons"
import { VIEWS } from "../../constants/views"
type HeaderConfig = {
  title: string
  buttons: HeaderButton[]
}

type HeaderButton = {
  // React.ReactNode: Tutto ciò che può essere renderizzato come etichetta
  // del bottone quindi può essere un'icona, un testo semplice o un componente React.
  label: React.ReactNode
  action: () => void
}
export default function Header() {
  const { view, navigate } = useSettings()

  /**
   * Configurazione dell'header in base alla vista corrente.
   * Ritorna un oggetto contenente il titolo e i bottoni da visualizzare.
   * - `title`: Il titolo da visualizzare nell'header.
   * - `buttons`: Array di bottoni da visualizzare nell'header.
   */
  const getConfig = (): HeaderConfig => {
    switch (view) {
      case VIEWS.settings:
        return {
          title: "Impostazioni",
          buttons: [],
        }
      case VIEWS.newPrompt:
        return {
          title: "Nuovo Prompt",
          buttons: [
            {
              label: getIcon(ICON_KEY.settings),
              action: () => navigate(VIEWS.settings)
            },
          ],
        }
      case VIEWS.newSet:
        return {
          title: "Nuovo Set",
          buttons: [
            {
              label: getIcon(ICON_KEY.settings),
              action: () => navigate(VIEWS.settings)
            },
          ],
        }
      case VIEWS.editSet:
        return {
          title: "Modifica Set",
          buttons: [],
        }
      case VIEWS.chooseSet:
        return {
          title: "Scegli Set",
          buttons: [
            {
              label: "Crea nuovo Set",
              action: () => navigate(VIEWS.newSet)
            },
            {
              label: getIcon(ICON_KEY.settings),
              action: () => navigate(VIEWS.settings)
            },
          ],
        }
      case VIEWS.activeSet:
      default:
        return {
          title: "Il tuo set di prompt",
          buttons: [
            {
              label: "Crea nuovo Prompt",
              action: () => navigate(VIEWS.newPrompt)
            },
            // { label: "Cambia Set", action: () => navigate(VIEWS.chooseSet) },
            {
              label: getIcon(ICON_KEY.settings),
              action: () => navigate(VIEWS.settings)
            },
          ],
        }
    }
  }

  const { title, buttons }: HeaderConfig = getConfig()

  return (
    <div className="header" >
      <h2>{title}</h2>
      <div className="header-buttons">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="btn"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}


