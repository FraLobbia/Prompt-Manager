import { useSettings } from "../../store/hooks"
import { getIcon, ICON_KEY } from "../../constants/icons"
import { VIEWS } from "../../constants/views"

export default function Header() {
  const { view, navigate, buttonNumberClass } = useSettings()

  /**
   * Ritorna la configurazione del titolo e dei bottoni per l'header
   * in base alla vista corrente.
   */
  const getConfig = (): HeaderConfig => {
    switch (view) {
      case VIEWS.settings:
        return {
          title: "Impostazioni",
          buttons: [
            { label: getIcon(ICON_KEY.close), action: () => navigate(VIEWS.activeSet) },
          ],
        }
      case VIEWS.newPrompt:
        return {
          title: "Nuovo Prompt",
          buttons: [
            { label: getIcon(ICON_KEY.close), action: () => navigate(VIEWS.activeSet) },
            { label: getIcon(ICON_KEY.settings), action: () => navigate(VIEWS.settings) },
          ],
        }
      case VIEWS.newSet:
        return {
          title: "Nuovo Set",
          buttons: [
            { label: getIcon(ICON_KEY.close), action: () => navigate(VIEWS.chooseSet) },
            { label: getIcon(ICON_KEY.settings), action: () => navigate(VIEWS.settings) },
          ],
        }
      case VIEWS.editPrompt:
        return {
          title: "Modifica Prompt",
          buttons: [
            { label: getIcon(ICON_KEY.close), action: () => navigate(VIEWS.activeSet) },
          ],
        }
      case VIEWS.editSet:
        return {
          title: "Modifica Set",
          buttons: [
            { label: getIcon(ICON_KEY.close), action: () => navigate(VIEWS.chooseSet) },
          ],
        }
      case VIEWS.chooseSet:
        return {
          title: "Scegli Set",
          buttons: [
            { label: "Crea Set", action: () => navigate(VIEWS.newSet) },
            { label: getIcon(ICON_KEY.close), action: () => navigate(VIEWS.activeSet) },
            { label: getIcon(ICON_KEY.settings), action: () => navigate(VIEWS.settings) },
          ],
        }
      case VIEWS.activeSet:
      default:
        return {
          title: "Prompt Manager",
          buttons: [
            { label: "Crea Prompt", action: () => navigate(VIEWS.newPrompt) },
            { label: "Cambia Set", action: () => navigate(VIEWS.chooseSet) },
            { label: getIcon(ICON_KEY.settings), action: () => navigate(VIEWS.settings) },
          ],
        }
    }
  }

  const { title: headerTitle, buttons } = getConfig()

  return (
    <div className={`header button-${buttonNumberClass}`}>
      <h2 className="title">{headerTitle}</h2>
      <div className="header-buttons">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`button-${buttonNumberClass}`}
            style={i > 0 ? { marginLeft: "0.3rem" } : undefined}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
type HeaderConfig = {
  title: string
  buttons: HeaderButton[]
}

type HeaderButton = {
  // React.ReactNode: Tutto ciò che può essere renderizzato come etichetta
  // del bottone quindi può essere un'icona, un testo o un componente React.
  label: React.ReactNode
  action: () => void
}

