import { useSettings } from "../../store/hooks"

interface HeaderProps {
  title?: string
  showForm?: boolean
  showSettings?: boolean
  onShowFormChange?: (show: boolean) => void
  onShowSettingsChange?: (show: boolean) => void
}

export default function Header({
  title = "Wassà",
  showForm = false,
  showSettings = false,
  onShowFormChange,
  onShowSettingsChange,
}: HeaderProps) {
  const { buttonNumberClass } = useSettings()
  
  const handleToggleForm = () => {
    const newShowForm = !showForm
    onShowFormChange?.(newShowForm)
    // Se apriamo il form, chiudiamo le settings
    if (newShowForm && showSettings) {
      onShowSettingsChange?.(false)
    }
  }
  
  const handleToggleSettings = () => {
    const newShowSettings = !showSettings
    onShowSettingsChange?.(newShowSettings)
    // Se apriamo le settings, chiudiamo il form
    if (newShowSettings && showForm) {
      onShowFormChange?.(false)
    }
  }

  const settingsIcon = showSettings ? "❌" : "⚙️"
  
  return (
    <div className={`header button-${buttonNumberClass}`}>
      <h2 className="title">{showSettings ? "Impostazioni" : title}</h2>
      <div className="header-buttons">
        {!showSettings && (
          <button onClick={handleToggleForm} className={`button-${buttonNumberClass}`}>
            {showForm ? "Chiudi" : "Crea nuovo"}
          </button>
        )}
        <button
          onClick={handleToggleSettings}
          className={`button-${buttonNumberClass}`}
          title="Impostazioni"
          aria-pressed={showSettings}
        >
          {settingsIcon}
        </button>
      </div>
    </div>
  )
}
