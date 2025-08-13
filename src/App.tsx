// src/App.tsx
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import type { ThunkDispatch } from "@reduxjs/toolkit"
import type { AnyAction } from "redux"
import { loadSettingsFromStorage, loadPromptsFromStorage, loadPromptSetsFromStorage } from "./persistence/storage.thunks"

import Header from "./components/common/Header"
import SettingsPanel from "./components/settingsPanel/SettingsPanel"
import PromptList from "./components/prompt/PromptList"
import PromptForm from "./components/prompt/PromptForm"
import { VIEWS } from "./constants/views"

function EditPromptPlaceholder() {
  return <div>{/* TODO: <EditForm /> */}Modifica Prompt – componente mancante</div>
}
function EditSetPlaceholder() {
  return <div>{/* TODO: <EditSetForm /> */}Modifica Set – componente mancante</div>
}

import type { RootState } from "./store/store"
import type { AppDispatch } from "./store/store"
import { useSettings } from "./store/hooks"
import PromptSetForm from "./components/promptset/PromptSetForm"
import PromptSetList from "./components/promptset/PromptSetList"
// no need to import slice-level loader; we use the storage-level uniform thunk

export function App() {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch<AppDispatch>()
  const { view, navigate } = useSettings()

  /** Carica le impostazioni e i prompt/set dallo storage all'avvio dell'app. */
  useEffect(() => {
    dispatch(loadSettingsFromStorage())
    dispatch(loadPromptsFromStorage())
    dispatch(loadPromptSetsFromStorage())
  }, [dispatch])

  /**
   * Renderizza la vista corrente in base allo stato.
   * @returns {React.ReactElement | null} Il componente da renderizzare o null se la vista non è valida.
   */
  const renderView = (): React.ReactElement | null => {
    switch (view) {
      case "settings":
        return <SettingsPanel />

      case "activeSet":
        return <PromptList />

      case "newPrompt":
        // dopo il submit torna alla vista principale
        return <PromptForm mode="new" onComplete={() => navigate(VIEWS.activeSet)} />

      case "newSet":
        return <PromptSetForm />

      case "editPrompt":
        return <EditPromptPlaceholder />

      case "editSet":
        return <EditSetPlaceholder />

      case "chooseSet":
        return <PromptSetList />

      default: {
        // Se la view non è ancora stata caricata (es. inizializzazione), evita di renderizzare fallback arbitrari
        return null
      }
    }
  }

  let backButton = null;
  let cambiaSetButton = null;
  if (view === VIEWS.activeSet) {
    cambiaSetButton = (
      <button
        className="btn-back p-0"
        onClick={() => navigate(VIEWS.chooseSet)}
      >
        Cambia Set
      </button>
    );
  } else {
    // Tasto indietro a sinistra
    backButton = (
      <button
        className="btn-back"
        onClick={() => {
          // Logica indietro come in Header
          switch (view) {
        case VIEWS.settings:
        case VIEWS.editPrompt:
        case VIEWS.newPrompt:
          navigate(VIEWS.activeSet);
          break;
        case VIEWS.editSet:
          navigate(VIEWS.chooseSet);
          break;
        case VIEWS.newSet:
          navigate(VIEWS.chooseSet);
          break;
        case VIEWS.chooseSet:
          navigate(VIEWS.activeSet);
          break;
        default:
          break;
          }
        }}
      >
        ←
      </button>
    );
  }

  return (
    <div className="popup-container">
      <Header />
      <div className="flex-row flex-fill mt-5" style={{ width: '100%' }}>
        {backButton}
        {cambiaSetButton}
        <div style={{ width: "100%" }}>
          {renderView()}
        </div>
      </div>
    </div>
  );
}

export default App
