import { useSettings } from "../../store/hooks"

interface HeaderProps {
  title: string
  showForm: boolean
  showSettings: boolean
  onShowFormChange: (show: boolean) => void
  onShowSettingsChange: (show: boolean) => void
}

export default function Header({
  title,
  showForm,
  showSettings,
  onShowFormChange,
  onShowSettingsChange,
}: HeaderProps) {
  const { buttonNumberClass } = useSettings()

  /**
   * Gestisce il toggle delle impostazioni.
   * Se le impostazioni vengono aperte, chiude il form di creazione.
   * Se le impostazioni vengono chiuse, riapre il form se era aperto.
   */
  const handleToggleSettings = () => {
    const newShowSettings = !showSettings
    onShowSettingsChange(newShowSettings)
    if (newShowSettings && showForm) {
      onShowFormChange(false)
    }
  }

  const settingsIcon = showSettings ? "❌" : "⚙️"

  return (
    <div className={`header button-${buttonNumberClass}`}>
      <h2 className="title">{showSettings ? "Impostazioni" : title}</h2>
      <div className="header-buttons">
        {!showSettings && (
          <button
            onClick={() => {
              const newShowForm = !showForm
              onShowFormChange(newShowForm)
              if (newShowForm && showSettings) {
                onShowSettingsChange(false)
              }
            }}
            className={`button-${buttonNumberClass}`}
          >
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
