import { useState } from "react"
import { useSettings } from "../store/hooks"

interface HeaderProps {
  title?: string
  onShowFormChange?: (show: boolean) => void
  onShowSettingsChange?: (show: boolean) => void
}

export default function Header({
  title = "Wassà",
  onShowFormChange,
  onShowSettingsChange,
}: HeaderProps) {
  const { buttonNumberClass } = useSettings()
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const handleToggleForm = () => {
    const newShowForm = !showForm
    setShowForm(newShowForm)
    onShowFormChange?.(newShowForm)
    // Se apriamo il form, chiudiamo le settings
    if (newShowForm && showSettings) {
      setShowSettings(false)
      onShowSettingsChange?.(false)
    }
  }
  
  const handleToggleSettings = () => {
    const newShowSettings = !showSettings
    setShowSettings(newShowSettings)
    onShowSettingsChange?.(newShowSettings)
    // Se apriamo le settings, chiudiamo il form
    if (newShowSettings && showForm) {
      setShowForm(false)
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
