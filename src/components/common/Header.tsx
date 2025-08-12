import { useSettings } from "../../store/hooks"
import { getIcon, ICON_KEY } from "../../constants/icons"
import { VIEWS } from "../../constants/views"

export default function Header() {
  const { view, navigate } = useSettings()

  /**
   * Ritorna la configurazione del titolo e dei bottoni per l'header
   * in base alla vista corrente.
   */
  const getConfig = (): HeaderConfig => {
    switch (view) {
      case VIEWS.settings:
        return {
          title: "Impostazioni",
          back: () => navigate(VIEWS.activeSet),
          buttons: [],
        }
      case VIEWS.newPrompt:
        return {
          title: "Nuovo Prompt",
          back: () => navigate(VIEWS.activeSet),
          buttons: [
            { label: getIcon(ICON_KEY.settings), action: () => navigate(VIEWS.settings) },
          ],
        }
      case VIEWS.newSet:
        return {
          title: "Nuovo Set",
          back: () => navigate(VIEWS.chooseSet),
          buttons: [
            { label: getIcon(ICON_KEY.settings), action: () => navigate(VIEWS.settings) },
          ],
        }
      case VIEWS.editPrompt:
        return {
          title: "Modifica Prompt",
          back: () => navigate(VIEWS.activeSet),
          buttons: [],
        }
      case VIEWS.editSet:
        return {
          title: "Modifica Set",
          back: () => navigate(VIEWS.chooseSet),
          buttons: [],
        }
      case VIEWS.chooseSet:
        return {
          title: "Scegli Set",
          back: () => navigate(VIEWS.activeSet),
          buttons: [
            { label: "Crea Set", action: () => navigate(VIEWS.newSet) },
            { label: getIcon(ICON_KEY.settings), action: () => navigate(VIEWS.settings) },
          ],
        }
      case VIEWS.activeSet:
      default:
        return {
          title: "Prompt Manager",
          back: undefined,
          buttons: [
            { label: "Crea Prompt", action: () => navigate(VIEWS.newPrompt) },
            { label: "Cambia Set", action: () => navigate(VIEWS.chooseSet) },
            { label: getIcon(ICON_KEY.settings), action: () => navigate(VIEWS.settings) },
          ],
        }
    }
  }

  const { title: headerTitle, buttons, back } = getConfig()

  return (
    <div className="header header--with-back" style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
      <h2 className="title" style={{ flex: 1, margin: 0 }}>{headerTitle}</h2>
      <div className="header-buttons" style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
        {back && (
          <button
            type="button"
            aria-label="Torna indietro"
            className="btn btn--back"
            onClick={back}
            style={{ fontSize: '1rem' }}
          >
            {getIcon(ICON_KEY.back)}
          </button>
        )}
        {back && buttons.length > 0 && (
          <div aria-hidden="true" style={{ width: 1, alignSelf: 'stretch', background: '#ccc', opacity: .6 }} />
        )}
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
type HeaderConfig = {
  title: string
  back?: () => void
  buttons: HeaderButton[]
}

type HeaderButton = {
  // React.ReactNode: Tutto ciò che può essere renderizzato come etichetta
  // del bottone quindi può essere un'icona, un testo o un componente React.
  label: React.ReactNode
  action: () => void
}

