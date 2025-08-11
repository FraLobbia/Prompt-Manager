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

export type Views =
  | "settings"
  | "activeSet"
  | "newPrompt"
  | "newSet"
  | "editPrompt"
  | "editSet"
  | "chooseSet";

/** Stato iniziale di default */
export const initialState: Settings = {
  view: "activeSet",
  clipboardReplace: true,
  buttonNumberClass: "53",
  activeSet: "default",
};
