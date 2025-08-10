// src/App.tsx
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import type { ThunkDispatch } from "@reduxjs/toolkit"
import type { AnyAction } from "redux"
import { loadSettingsFromStorage, loadWassasFromStorage } from "./persistence/storage"

import Header from "./components/common/Header"
import SettingsPanel from "./components/settingsPanel/SettingsPanel"
import WassaList from "./components/wassa/WassaList"
import NewWassaForm from "./components/wassa/NewWassa"

// Placeholder temporanei per view non ancora implementate
function NewSetPlaceholder() {
  return <div>{/* TODO: <NewSetForm /> */}Nuovo Set – componente mancante</div>
}
function EditWassaPlaceholder() {
  return <div>{/* TODO: <EditWassaForm /> */}Modifica Wassa – componente mancante</div>
}
function EditSetPlaceholder() {
  return <div>{/* TODO: <EditSetForm /> */}Modifica Set – componente mancante</div>
}

import type { RootState } from "./store/store"
import type { AppDispatch } from "./store/store"
import { useSettings } from "./store/hooks"

export function App() {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch<AppDispatch>()
  const { view, navigate } = useSettings()

  /**
   * Carica le impostazioni e le wassas dallo storage all'avvio dell'app.
   */
  useEffect(() => {
    dispatch(loadSettingsFromStorage())
    dispatch(loadWassasFromStorage())
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
        return <WassaList />

      case "newWassa":
        // dopo il submit torna alla vista principale
        return <NewWassaForm onSubmit={() => navigate("activeSet")} />

      case "newSet":
        return <NewSetPlaceholder />

      case "editWassa":
        return <EditWassaPlaceholder />

      case "editSet":
        return <EditSetPlaceholder />

      default: {
        // Se la view non è ancora stata caricata (es. inizializzazione), evita di renderizzare fallback arbitrari
        return null
      }
    }
  }

  return (
    <div className="popup-container">
      <Header title="Wassà" />
      {renderView()}
    </div>
  )
}

export default App
