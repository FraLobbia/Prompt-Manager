import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { ThunkDispatch } from "@reduxjs/toolkit";
import type { AnyAction } from "redux";
import { loadUseClipboardFromStorage, loadWassasFromStorage } from "./utils/storage";
import Popup from "./components/popup/Popup";
import type { RootState } from "./store/store";
import type { AppDispatch } from "./store/store";

export function App() {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch<AppDispatch>();

  useEffect(() => {
    // Carica sia settings che prompt all'avvio
    dispatch(loadUseClipboardFromStorage());
    dispatch(loadWassasFromStorage());
  }, [dispatch]);

  return <Popup />;
}
