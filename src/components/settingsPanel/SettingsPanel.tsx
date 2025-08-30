import React, { useState } from 'react'
import { useAppDispatch, useSettings } from '../../store/hooks'
import { exportBackup, importSinglePromptSetFromJson, parsePromptSetJson } from '../../utils/utils'
import { getIcon, ICON_KEY } from '../../constants/icons'
import { importBackupFromString } from "../../persistence/storage.import";
import { loadPromptSetsFromStorage, loadPromptsFromStorage, loadSettingsFromStorage } from '../../persistence/storage.thunks';

export default function SettingsPanel() {
  /** Stato globale */
  const {
    clipboardReplaceEnabled,
    setclipboardReplaceEnabled,
    clipboardTemplate,
    setClipboardTemplate,
    modifyOnClickEnabled,
    setModifyOnClickEnabled,
  } = useSettings()

  /** Stato locale  */
  const [rawSetJson, setRawSetJson] = useState<string>("");
  const [validationMsg, setValidationMsg] = useState<string>("");

  /** Utility */
  const dispatch = useAppDispatch();
  /** Validazione live */
  const validate = (s: string) => {
    try {
      parsePromptSetJson(s);
      setValidationMsg("Valido ✓");
      return true;
    } catch (err: any) {
      setValidationMsg(err?.message || "JSON non valido");
      return false;
    }
  };

  const onPasteSetImport = async () => {
    if (!validate(rawSetJson)) return;
    try {
      const res = await dispatch(importSinglePromptSetFromJson(rawSetJson));
      alert(`Set importato. Nuovo id: ${(res as any).newSetId}`);
      setRawSetJson("");
      setValidationMsg("");
    } catch (e) {
      console.error(e);
      alert("Errore durante l'import del set.");
    }
  };


  /**
   * Gestisce l'import di un file JSON di backup.
   * - Legge il file come stringa
   * - Importa con modalità overwrite o add-only
   * - Risincronizza lo stato Redux dal persistence layer
   *
   * @param e ChangeEvent dell'input file
   * @param overwrite Se true sovrascrive, se false aggiunge soltanto
   */
  const onImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
    overwrite: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const json = await file.text();                 // 1) leggi contenuto
      await importBackupFromString(json, overwrite);  // 2) importa

      // 3) ricarica stato Redux
      await Promise.all([
        dispatch(loadSettingsFromStorage()),
        dispatch(loadPromptsFromStorage()),
        dispatch(loadPromptSetsFromStorage()),
      ]);

      alert(
        `Backup importato correttamente: ${overwrite ? "sovrascrittura" : "solo aggiunta"}.`
      );
    } catch (error) {
      console.error("Errore durante l'importazione:", error);
      alert("Errore durante l'importazione del backup.");
    } finally {
      // Permette di selezionare di nuovo lo stesso file
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="card">
      <div className="gap-1 flex-between">
        <h2>Impostazioni generali</h2>
        <a
          id='buy-coffee'
          href="https://buymeacoffee.com/frnk.j"
          target="_blank"
          rel="noopener noreferrer"
        >
          ☕ Offrimi un caffè
        </a>
      </div>

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
          <span><strong>Il click su un prompt del set attivo apre la modifica dello stesso</strong></span>
        </label>
      </div>

      <hr />
      <div className="card">
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
              {getIcon(ICON_KEY.save)} Esporta backup (JSON)
            </button>

            <label>
              <span className="btn">{getIcon(ICON_KEY.add)} Ripristina da backup (sovrascrive tutto)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => onImport(e, true)}
                style={{ display: 'none' }}
              />
            </label>

            <label>
              <span className="btn">{getIcon(ICON_KEY.add)} Importa da JSON (aggiunge)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => onImport(e, false)}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
        <div>
          <h3>Import rapido set da JSON</h3>
          <p className="text-muted my-2">Incolla qui un JSON di set valido. Verranno aggiunti solo i prompt mancanti e il set (con id univoco se esiste già).</p>
          <textarea
            rows={6}
            value={rawSetJson}
            onChange={(e) => { setRawSetJson(e.target.value); validate(e.target.value); }}
            placeholder='{"promptSets":[{ "id":"my-set", "titolo":"My Set", "prompts":[{ "id":"p1","titolo":"..." }] }], "prompts":[...] } oppure un singolo PromptSet'
            style={{ width: "100%" }}
          />
          <div
            aria-live="polite"
            className={`mt-1 ${validationMsg.startsWith("Valido") ? "text-success" : "text-danger"}`}
          >
            {validationMsg || "In attesa di input..."}
          </div>
          <button
            type="button"
            className="btn mt-2"
            onClick={onPasteSetImport}
            disabled={!rawSetJson || !validationMsg.startsWith("Valido")}
          >
            Aggiungi set da JSON
          </button>
        </div>
      </div>
    </div>
  )
}
