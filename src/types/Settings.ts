import type { ViewValue } from "../constants/views";
export class Settings {
  view: Views;
  clipboardReplace: boolean;
  buttonNumberClass: string;
  activeSet?: string; // contiene solo l'ID del set attivo

  constructor(
    view: Views,
    clipboardReplace: boolean,
    buttonNumberClass: string,
    activeSet?: string
  ) {
    this.view = view;
    this.clipboardReplace = clipboardReplace;
    this.buttonNumberClass = buttonNumberClass;
    this.activeSet = activeSet;
  }
}

export type Views = ViewValue;

/** Stato iniziale di default */
export const initialState: Settings = {
  view: "activeSet",
  clipboardReplace: true,
  buttonNumberClass: "53",
  activeSet: "default",
};
