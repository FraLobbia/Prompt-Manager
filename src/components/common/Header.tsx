import { useSettings } from "../../store/hooks"
import { VIEWS } from "../../constants/views"
import { useSelector } from "react-redux"
import { promptSelectors } from "../../store/selectors/promptSelectors"
import type { PromptSet } from "../../types/PromptSet"
type HeaderConfig = {
  title: React.ReactNode
  buttons: HeaderButton[]
}

type HeaderButton = {
  // React.ReactNode: Tutto ciò che può essere renderizzato come etichetta
  // del bottone quindi può essere un'icona, un testo semplice o un componente React.
  label: React.ReactNode
  action: () => void
}
export default function Header() {
  const { view, navigate, activeSet } = useSettings()
  const set: PromptSet | undefined = useSelector(promptSelectors.selectResolvedPromptSets).find(set => set.id === activeSet);
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
          title: <h1>Impostazioni</h1>,
          buttons: [
            {
              label: <img className="settings-icon" src="/images/settings.png" alt="icona impostazioni" />,
              action: () => navigate(VIEWS.activeSet)
            },
          ],
        }
      case VIEWS.newPrompt:
        return {
          title: <h1>Nuovo Prompt</h1>,
          buttons: [
            {
              label: <img className="settings-icon" src="/images/settings.png" alt="icona impostazioni" />,
              action: () => navigate(VIEWS.settings)
            },
          ],
        }
      case VIEWS.newSet:
        return {
          title: <h1>Nuovo Set</h1>,
          buttons: [
            {
              label: <img className="settings-icon" src="/images/settings.png" alt="icona impostazioni" />,
              action: () => navigate(VIEWS.settings)
            },
          ],
        }
      case VIEWS.editSet:
        return {
          title: <h1>Modifica Set</h1>,
          buttons: [],
        }
      case VIEWS.chooseSet:
        return {
          title: <h1>Scegli un Set</h1>,
          buttons: [
            {
              label: <strong>Nuovo Set</strong>,
              action: () => navigate(VIEWS.newSet)
            },
            {
              label: <img className="settings-icon" src="/images/settings.png" alt="icona impostazioni" />,
              action: () => navigate(VIEWS.settings)
            },
          ],
        }
      case VIEWS.activeSet:
      default:
        return {
          title: <><label className="text-muted">Set attuale:</label> <h1>{set?.titolo || ""}</h1></>,
          buttons: [
            {
              label: <strong>Nuovo Prompt</strong>,
              action: () => navigate(VIEWS.newPrompt)
            },
            // { label: "Cambia Set", action: () => navigate(VIEWS.chooseSet) },
            {
              label: <img className="settings-icon" src="/images/settings.png" alt="icona impostazioni" />,
              // label: getIcon(ICON_KEY.settings),
              action: () => navigate(VIEWS.settings)
            },
          ],
        }
    }
  }

  const { title, buttons }: HeaderConfig = getConfig()

  return (
    <div className="header" >
      <div className="flex-column">
        {title}
      </div>
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


