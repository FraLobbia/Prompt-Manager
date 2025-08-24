// src/persistence/storage.adapters.ts
import { Settings, initialState } from "../types/Settings";

/** ------------------------
 *  Adattatori Settings (schema corrente)
 *  ------------------------ */

/**
 * Forma serializzata nello storage (schema attuale)
 * Serve a convertire le impostazioni in un formato adatto per lo storage.
 */
export type StoredSettings = {
  view: Settings["view"];
  clipboardReplaceEnabled: boolean;
  clipboardTemplate: string;
  activeSet?: string;
  editingSetId?: string;
  modifyOnClickEnabled: boolean;
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
    clipboardReplaceEnabled: s.clipboardReplaceEnabled,
    clipboardTemplate: s.clipboardTemplate,
    activeSet: s.activeSet,
    editingSetId: s.editingSetId,
    modifyOnClickEnabled: s.modifyOnClickEnabled,
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

  const view = (obj.view ?? initialState.view) as Settings["view"];

  return {
    view,
    clipboardReplaceEnabled: obj.clipboardReplaceEnabled ?? initialState.clipboardReplaceEnabled,
    clipboardTemplate: obj.clipboardTemplate ?? initialState.clipboardTemplate,
    activeSet: obj.activeSet ?? initialState.activeSet,
    editingSetId: obj.editingSetId ?? initialState.editingSetId,
    modifyOnClickEnabled: obj.modifyOnClickEnabled ?? initialState.modifyOnClickEnabled,
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
    activeSet: patch.activeSet ?? base.activeSet,
    editingSetId: patch.editingSetId,
    clipboardReplaceEnabled: patch.clipboardReplaceEnabled ?? base.clipboardReplaceEnabled,
    clipboardTemplate: patch.clipboardTemplate ?? base.clipboardTemplate,
    modifyOnClickEnabled: patch.modifyOnClickEnabled ?? base.modifyOnClickEnabled,
  };
}
