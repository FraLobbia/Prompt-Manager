import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { ThunkDispatch } from "@reduxjs/toolkit";
import type { AnyAction } from "redux";
import { loadUseClipboardFromStorage, loadPromptsFromStorage } from "./utils/storage";
import Popup from "./popup/Popup";
import type { RootState } from "./store/store";
import type { AppDispatch } from "./store/store";

export function App() {
  const dispatch: ThunkDispatch<RootState, unknown, AnyAction> = useDispatch<AppDispatch>();

  useEffect(() => {
    // Carica sia settings che prompt all'avvio
    dispatch(loadUseClipboardFromStorage());
    dispatch(loadPromptsFromStorage());
  }, [dispatch]);

  return <Popup />;
}
