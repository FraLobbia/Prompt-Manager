import { saveSettings } from "../utils/storage"
import "./SettingsPanel.scss"

export default function SettingsPanel({
  onClose,
  useClipboard,
  setUseClipboard
}: {
  onClose: () => void,
  useClipboard: boolean,
  setUseClipboard: (val: boolean) => void
}) {
  const handleSave = () => {
    saveSettings({ useClipboard })
    onClose()
  }

  const buttonNumberClass = "53" // classe per il numero del bottone, se necessario

  return (
    <div className="settings-panel">
      <label className="settings-checkbox-label">
        <input
          type="checkbox"
          checked={useClipboard}
          onChange={(e) => setUseClipboard(e.target.checked)}
          className="settings-checkbox"
        />
        Abilita inserimento appunti (#clipboardcontent)
      </label>

      <div className="settings-buttons">
        <button className={`button-${buttonNumberClass}`} onClick={handleSave}>
          Salva
        </button>
        <button className={`button-${buttonNumberClass}`} onClick={onClose}>
          Annulla
        </button>
      </div>
    </div>
  )
}
