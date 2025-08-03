import React from "react"

interface HeaderProps {
  title?: string
  onToggleForm: () => void
  showForm: boolean
  onToggleSettings: () => void
  showSettings: boolean
}

export default function Header({
  title = "Wassà",
  onToggleForm,
  showForm,
  onToggleSettings,
  showSettings,
}: HeaderProps) {
  const settingsIcon = showSettings ? "❌" : "⚙️"  // puoi usare anche altre icone SVG

  return (
    <div className="header">
      <h2 className="title">{showSettings ? "Impostazioni" : title}</h2>
      <div className="header-buttons">
        {!showSettings && (
          <button onClick={onToggleForm} className="btn-create-toggle">
            {showForm ? "Chiudi" : "Crea nuovo"}
          </button>
        )}
        <button
          onClick={onToggleSettings}
          className="btn-settings"
          title="Impostazioni"
          aria-pressed={showSettings}
        >
          {settingsIcon}
        </button>
      </div>
    </div>
  )
}
