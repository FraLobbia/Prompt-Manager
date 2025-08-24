import React from 'react'
import { useSettings } from '../../store/hooks'
import { useDispatch } from 'react-redux'
import { exportBackup, importBackup } from '../../utils/utils'
import { getIcon, ICON_KEY } from '../../constants/icons'

export default function SettingsPanel() {
  const {
    clipboardReplaceEnabled,
    setclipboardReplaceEnabled,
    clipboardTemplate,
    setClipboardTemplate,
    modifyOnClickEnabled,
    setModifyOnClickEnabled,
  } = useSettings()
  const dispatch = useDispatch()

  /** Gestisce l'importazione di un file di backup JSON. */
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
    <div className="card">
      <h2>Impostazioni generali</h2>

      <div>
        <label className="settings-checkbox-label mt-3">
          <input
            type="checkbox"
            checked={clipboardReplaceEnabled}
            onChange={(e) => setclipboardReplaceEnabled(e.target.checked)}
          />
          <span><strong>Rimpiazza il segnaposto scelto con gli appunti</strong></span>
        </label>

        {clipboardReplaceEnabled && <div className='pl-5'>
          <label htmlFor="clipboard-template">
            Segnaposto da sostituire
          </label>
          <input
            id="clipboard-template"
            type="text"
            value={clipboardTemplate}
            onChange={(e) => setClipboardTemplate(e.target.value)}
            placeholder="es. PromptTemplate, {{template}}, #clipboardcontent"
            disabled={!clipboardReplaceEnabled}
          />
          <small className="text-muted">
            Il testo indicato verrà cercato e sostituito con il contenuto degli appunti.
          </small>
        </div>}
      </div>

      <div>
        <label className="settings-checkbox-label mt-3">
          <input
            type="checkbox"
            checked={modifyOnClickEnabled}
            onChange={(e) => setModifyOnClickEnabled(e.target.checked)}
          />
          <span><strong>Il click su un prompt apre la modifica dello stesso</strong></span>
        </label>
      </div>

      <hr />

      <div className="backup-header">
        <h2>Backup</h2>
        <span
          className="info-icon"
          title="Puoi esportare o importare un file di backup in formato JSON contenente tutte le tue impostazioni, i prompt e i set di prompt. In questo modo puoi salvare una copia dei tuoi dati sul computer o trasferirli facilmente su un altro dispositivo. Normalmente, le informazioni vengono salvate automaticamente nello spazio di sincronizzazione di Google Chrome, che ha un limite di circa 100 KB: superata questa soglia, parte dei dati più grandi viene memorizzata solo in locale sul dispositivo."
        >
          {getIcon(ICON_KEY.info)}
        </span>
      </div>

      <div>
        <div className="flex-row gap-1">
          <button className="btn" type="button" onClick={exportBackup}>
            {getIcon(ICON_KEY.save)} Esporta json
          </button>

          <label>
            <span className="btn">{getIcon(ICON_KEY.add)} Importa json</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={onImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <hr />

      {/* Sezione Buy Me a Coffee */}
      <div className="flex-row gap-1">
        <a
          className="btn"
          href="https://buymeacoffee.com/frnk.j"
          target="_blank"
          rel="noopener noreferrer"
        >
          ☕ Offrimi un caffè
        </a>
      </div>
    </div>
  )
}
