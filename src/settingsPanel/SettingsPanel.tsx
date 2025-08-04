import { useSettings } from "../store/hooks";

export default function SettingsPanel() {
  const { useClipboard, setUseClipboard } = useSettings();

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
    </div>
  );
}
