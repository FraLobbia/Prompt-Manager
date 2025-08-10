import { useSettings } from "../../store/hooks"

type HeaderProps = {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { view, navigate, buttonNumberClass } = useSettings()

  const getConfig = () => {
    switch (view) {
      case "settings":
        return {
          title: "Impostazioni",
          buttons: [
            { label: "❌", action: () => navigate("activeSet") },
          ],
        }
      case "newWassa":
        return {
          title: "Nuovo Wassà",
          buttons: [
            { label: "❌", action: () => navigate("activeSet") },
            { label: "⚙️", action: () => navigate("settings") },
          ],
        }
      case "newSet":
        return {
          title: "Nuovo Set",
          buttons: [
            { label: "❌", action: () => navigate("chooseSet") },
            { label: "⚙️", action: () => navigate("settings") },
          ],
        }
      case "editWassa":
        return {
          title: "Modifica Wassa",
          buttons: [
            { label: "❌", action: () => navigate("activeSet") },
          ],
        }
      case "editSet":
        return {
          title: "Modifica Set",
          buttons: [
            { label: "❌", action: () => navigate("chooseSet") },
          ],
        }
      case "chooseSet":
        return {
          title: "Scegli Set",
          buttons: [
            { label: "Crea Set", action: () => navigate("newSet") },
            { label: "❌", action: () => navigate("activeSet") },
            { label: "⚙️", action: () => navigate("settings") },
          ],
        }
      case "activeSet":
      default:
        return {
          title,
          buttons: [
            { label: "Crea Wassà", action: () => navigate("newWassa") },
            { label: "Cambia Set", action: () => navigate("chooseSet") },
            { label: "⚙️", action: () => navigate("settings") },
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
