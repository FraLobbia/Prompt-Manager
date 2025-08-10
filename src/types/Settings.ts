import type { WassaSet } from "./WassaSet";

export class Settings {
  view: Views;
  clipboardReplace: boolean;
  buttonNumberClass: string;
  activeSet?: WassaSet;

  constructor(
    view: Views,
    clipboardReplace: boolean,
    buttonNumberClass: string,
    activeSet?: WassaSet
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
  | "newWassa"
  | "newSet"
  | "editWassa"
  | "editSet"
  | "chooseSet";

/** Stato iniziale di default */
export const initialState: Settings = {
  view: "activeSet",
  clipboardReplace: true,
  buttonNumberClass: "53",
  activeSet: undefined,
};
