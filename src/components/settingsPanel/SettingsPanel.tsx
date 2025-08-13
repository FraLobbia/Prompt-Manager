import { useSettings } from '../../store/hooks'
import { useDispatch } from 'react-redux'
import { exportBackup, importBackup } from '../../utils/utils'
import { getIcon, ICON_KEY } from '../../constants/icons'

export default function SettingsPanel() {
  const { clipboardReplace, setClipboardReplace, buttonNumberClass, setButtonNumberClass } = useSettings()
  const dispatch = useDispatch()

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
      
      <div id='general-settings'>
        <label className="settings-checkbox-label">
          <input
            type="checkbox"
            checked={clipboardReplace}
            onChange={(e) => setClipboardReplace(e.target.checked)}
            className="settings-checkbox"
          />
          <span>
            Abilita sostituzione <strong>"PromptTemplate"</strong> (compatibile anche con "PromptTemplate") con gli appunti
          </span>
        </label>

        <label className="settings-input-label">
          <div className="flex-row">
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
        <div className="flex-row">
          <button className={`button-${buttonNumberClass}`} onClick={onExport}>
            {getIcon(ICON_KEY.save)} Esporta json
          </button>
          <label className="import-button-label">
            <span className={`button-${buttonNumberClass}`}>{getIcon(ICON_KEY.add)} Importa json</span>
            <input type="file" accept=".json" onChange={onImport} style={{ display: "none" }} />
          </label>
        </div>
      </div>
    </div>
  )
}
