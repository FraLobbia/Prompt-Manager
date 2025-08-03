import React from "react"

interface HeaderProps {
  title?: string
  onToggleForm: () => void
  showForm: boolean
  onToggleSettings: () => void  // cambia da onOpenSettings a onToggleSettings
  showSettings: boolean         // passo anche lo stato showSettings
}

export default function Header({
  title = "Wassà",
  onToggleForm,
  showForm,
  onToggleSettings,
  showSettings,
}: HeaderProps) {
  return (
    <div className="header">
      <h2 className="title">{title}</h2>
      <div className="header-buttons">
        <button onClick={onToggleForm} className="btn-create-toggle">
          {showForm ? "Chiudi" : "Crea nuovo"}
        </button>
        <button
          onClick={onToggleSettings}
          className="btn-settings"
          title="Impostazioni"
          aria-pressed={showSettings}
        >
          ⚙️
        </button>
      </div>
    </div>
  )
}
