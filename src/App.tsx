import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { ThunkDispatch } from "@reduxjs/toolkit";
import type { AnyAction } from "redux";
import { loadSettingsFromStorage, loadWassasFromStorage } from "./persistence/storage";
import WassaList from "./components/wassa/WassaList";
import SettingsPanel from "./components/settingsPanel/SettingsPanel";
import Header from "./components/common/Header";
import NewWassaForm from "./components/wassa/NewWassa";
import type { RootState } from "./store/store";
import type { AppDispatch } from "./store/store";

export function App() {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch<AppDispatch>();
  
  const title = "Wassà";
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
/**
 * Effettua il caricamento delle impostazioni e delle wassas all'avvio dell'app.
 */
  useEffect(() => {
    dispatch(loadSettingsFromStorage());
    dispatch(loadWassasFromStorage());
  }, [dispatch]);

  return (
    <div className="popup-container">
      <Header
        title={title}
        showForm={showForm}
        showSettings={showSettings}
        onShowFormChange={setShowForm}
        onShowSettingsChange={setShowSettings}
      />
      {showSettings ? (
        <SettingsPanel />
      ) : showForm ? (
        <NewWassaForm showForm={showForm} onSubmit={() => setShowForm(false)} />
      ) : (
        <WassaList editId={editId} setEditId={setEditId} />
      )}
    </div>
  );
}
