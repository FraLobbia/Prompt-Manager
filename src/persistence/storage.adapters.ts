// src/persistence/storage.adapters.ts
import { Settings, initialState } from "../types/Settings";

/** ------------------------
 *  Adattatori Settings
 *  ------------------------ */

/**
 * Forma serializzata nello storage (con supporto legacy)
 * Serve a convertire le impostazioni in un formato adatto per lo storage.
 */
export type StoredSettings = {
  view: Settings["view"] | "newPrompt" | "editPrompt";
  clipboardReplace: boolean;
  buttonNumberClass: string;
  activeSet?: string; // solo ID
  /** legacy support (vecchia chiave) */
  useClipboard?: boolean;
};

/**
 * Serializza Settings -> StoredSettings
 * Serve a convertire le impostazioni in un formato adatto per lo storage.
 *
 * @param s Le impostazioni da serializzare
 * @returns Le impostazioni serializzate
 */
export function toStored(s: Settings): StoredSettings {
  return {
    view: s.view,
    clipboardReplace: s.clipboardReplace,
    buttonNumberClass: s.buttonNumberClass,
    activeSet: s.activeSet,
  };
}

/**
 * Deserializza StoredSettings -> Settings, usando `initialState` come unico default.
 * Serve a garantire che tutte le proprietà siano presenti.
 * @param obj L'oggetto da deserializzare
 * @returns L'oggetto deserializzato
 */
export function fromStored(obj: Partial<StoredSettings> | undefined): Settings {
  if (!obj) {
    console.warn("Nessun oggetto da deserializzare, uso stato iniziale.");
    return { ...initialState };
  }

  const activeSetId = ((): string | undefined => {
    const raw = (obj as unknown as { activeSet?: unknown })?.activeSet;
    if (raw == null) return undefined;
    if (typeof raw === "string") return raw;
    if (typeof raw === "object") {
      const maybe = raw as { id?: unknown };
      if (typeof maybe.id === "string") return maybe.id;
    }
    return undefined;
  })();

  const view = ((): Settings["view"] => {
    const v = obj.view ?? initialState.view;
    // map legacy views
    if (v === "newPrompt") return "newPrompt";
    if (v === "editPrompt") return "editPrompt";
    return v as Settings["view"];
  })();

  return {
    view,
    clipboardReplace:
      obj.clipboardReplace ?? obj.useClipboard ?? initialState.clipboardReplace,
    buttonNumberClass: obj.buttonNumberClass ?? initialState.buttonNumberClass,
    activeSet: activeSetId ?? initialState.activeSet,
  };
}

/**
 * Esegue un merge immutabile tra le impostazioni di base e una patch.
 * Serve a combinare le impostazioni esistenti con eventuali modifiche.
 * @param base Le impostazioni di base
 * @param patch La patch da applicare
 * @returns Le impostazioni risultanti dopo il merge
 */
export function mergeSettings(base: Settings, patch: Partial<Settings>): Settings {
  return {
    view: patch.view ?? base.view,
    clipboardReplace: patch.clipboardReplace ?? base.clipboardReplace,
    buttonNumberClass: patch.buttonNumberClass ?? base.buttonNumberClass,
    activeSet: patch.activeSet ?? base.activeSet,
  };
}
