import { useSettings } from "../../store/hooks";
import { useDispatch } from "react-redux";
import { exportBackup, importBackup } from "../../utils/utils";

export default function SettingsPanel() {
  const { useClipboard, setUseClipboard, buttonNumberClass, setButtonNumberClass } = useSettings();
  const dispatch = useDispatch();

  const onExport = exportBackup;
  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importBackup(file, dispatch);
      alert("Backup importato correttamente.");
    } catch (error) {
      console.error("Errore durante l'importazione:", error);
      alert("Errore durante l'importazione del backup.");
    }
  };

  return (
    <div className="settings-panel">
      <label className="settings-checkbox-label">
        <input
          type="checkbox"
          checked={useClipboard}
          onChange={(e) => setUseClipboard(e.target.checked)}
          className="settings-checkbox"
        />
        <span>
          Abilita sostituzione <strong>"WassaTemplate"</strong> con gli appunti
        </span>
      </label>
      <hr />
      <label className="settings-input-label">
        <h3>Classe CSS bottoni:</h3>
        <input
          type="text"
          value={buttonNumberClass}
          onChange={(e) => setButtonNumberClass(e.target.value)}
          className="settings-input"
          placeholder="es. 53"
        />
      </label>

      <hr />
      <div className="settings-backup-buttons">
        <h3>Backup</h3>
        <div className="d-flex-row">
          <button className={`button-${buttonNumberClass}`} onClick={onExport}>Esporta json</button>
          <label className="import-button-label">
            <span className={`button-${buttonNumberClass}`}>Importa json</span>
            <input type="file" accept=".json" onChange={onImport} style={{ display: "none" }} />
          </label>
        </div>
      </div>
    </div>
  );
}
