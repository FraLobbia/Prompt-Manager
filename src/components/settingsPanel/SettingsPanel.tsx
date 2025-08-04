import { useSettings } from "../../store/hooks";

export default function SettingsPanel() {
  const { useClipboard, setUseClipboard, buttonNumberClass, setButtonNumberClass } = useSettings();

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
      
      <label className="settings-input-label">
        <span>Classe CSS bottoni:</span>
        <input
          type="text"
          value={buttonNumberClass}
          onChange={(e) => setButtonNumberClass(e.target.value)}
          className="settings-input"
          placeholder="es. 53"
        />
      </label>
    </div>
  );
}
