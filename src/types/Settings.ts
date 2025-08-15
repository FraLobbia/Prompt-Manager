import type { ViewValue } from "../constants/views";
export class Settings {
  view: Views;
  clipboardReplaceEnabled: boolean;
  clipboardTemplate: string;
  activeSet?: string; // contiene solo l'ID del set attivo

  constructor(
    view: Views,
    clipboardReplaceEnabled: boolean,
    clipboardTemplate: string,
    activeSet?: string
  ) {
    this.view = view;
    this.clipboardReplaceEnabled = clipboardReplaceEnabled;
    this.clipboardTemplate = clipboardTemplate;
    this.activeSet = activeSet;
  }
}

export type Views = ViewValue;

/** Stato iniziale di default */
export const initialState: Settings = {
  view: "activeSet",
  clipboardReplaceEnabled: true,
  activeSet: "default",
  clipboardTemplate: "{{template}}",
};
