import { useSettings, useWassaSets } from '../../store/hooks'
import { useDispatch } from 'react-redux'
import { exportBackup, importBackup } from '../../utils/utils'

export default function SettingsPanel() {
  const { activeSet, clipboardReplace, setClipboardReplace, buttonNumberClass, setButtonNumberClass, navigate } = useSettings()
  const dispatch = useDispatch()
  const { wassaSets } = useWassaSets()
  const active = wassaSets.find(s => s.id === activeSet)

  const onExport = exportBackup
  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importBackup(file, dispatch)
      alert('Backup importato correttamente.')
    } catch (error) {
      console.error('Errore durante l\'importazione:', error)
      alert('Errore durante l\'importazione del backup.')
    }
  }

  return (
    <div className="settings-panel">
      <div id='sets'>
  <h3>Sets di Wassà</h3>
  <p>Set attuale: <strong>{active?.titolo || 'Nessun set attivo'}</strong></p>
  <p>Set disponibili: <strong>{wassaSets.length}</strong></p>
        <br />
        <div className="d-flex-row">
          <button onClick={() => navigate("newSet")} className={`button-${buttonNumberClass}`}>
            Nuovo set
          </button>
          <button onClick={() => navigate("chooseSet")} className={`button-${buttonNumberClass}`}>
            Scegli set attivo
          </button>
        </div>
      </div>

      <hr />
      
      <div id='general-settings'>
        <label className="settings-checkbox-label">
          <input
            type="checkbox"
            checked={clipboardReplace}
            onChange={(e) => setClipboardReplace(e.target.checked)}
            className="settings-checkbox"
          />
          <span>
            Abilita sostituzione <strong>"WassaTemplate"</strong> con gli appunti
          </span>
        </label>

        <label className="settings-input-label">
        <div className="d-flex-row">
          <h3>Classe CSS bottoni:</h3>
          <input
            type="text"
            value={buttonNumberClass}
            onChange={(e) => setButtonNumberClass(e.target.value)}
            className="settings-input"
            placeholder="es. 53"
            style={{ marginInlineStart: '10px' }}
          />
        </div>
      </label>

      </div>

      <hr />

      <div className="settings-backup-buttons">
        <h3>Backup</h3>
        <br />
        <div className="d-flex-row">
          <button className={`button-${buttonNumberClass}`} onClick={onExport}>
            Esporta json
          </button>
          <label className="import-button-label">
            <span className={`button-${buttonNumberClass}`}>Importa json</span>
            <input type="file" accept=".json" onChange={onImport} style={{ display: "none" }} />
          </label>
        </div>
      </div>
    </div>
  )
}
