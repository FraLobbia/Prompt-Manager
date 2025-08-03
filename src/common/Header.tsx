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
 const buttonNumberClass = "53" // classe per il numero del bottone, se necessario
  return (
    <div className={`header button-${buttonNumberClass}`}>
      <h2 className="title">{showSettings ? "Impostazioni" : title}</h2>
      <div className="header-buttons">
        {!showSettings && (
          <button onClick={onToggleForm} className={`button-${buttonNumberClass}`}>
            {showForm ? "Chiudi" : "Crea nuovo"}
          </button>
        )}
        <button
          onClick={onToggleSettings}
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
