import { useSettings } from "../../store/hooks"

type HeaderProps = {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { view, navigate, buttonNumberClass } = useSettings()

  const isSettings = view === "settings"
  const isNewWassa = view === "newWassa"

  const handleToggleSettings = () => {
    navigate(isSettings ? "activeSet" : "settings")
  }

  const handleToggleNewWassa = () => {
    navigate(isNewWassa ? "activeSet" : "newWassa")
  }

  const settingsIcon = isSettings ? "❌" : "⚙️"

  return (
    <div className={`header button-${buttonNumberClass}`}>
      <h2 className="title">{isSettings ? "Impostazioni" : title}</h2>
      <div className="header-buttons">


        {/* Mostra toggle Nuova Wassa solo se NON sei nelle impostazioni */}
        {!isSettings && (
          <button onClick={handleToggleNewWassa} className={`button-${buttonNumberClass}`}>
            {isNewWassa ? "Chiudi" : "Crea nuovo"}
          </button>
        )}

        {/* Impostazioni */}
        <button
          onClick={handleToggleSettings}
          className={`button-${buttonNumberClass}`}
          title="Impostazioni"
          aria-pressed={isSettings}
        >
          {settingsIcon}
        </button>
      </div>
    </div>
  )
}
