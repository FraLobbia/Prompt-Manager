// src/persistence/storage.ts
import { Settings } from "../types/Settings";
import type { Prompt } from "../types/Prompt";
import type { PromptSet } from "../types/PromptSet";

import { SETTINGS_KEY, PROMPT_SETS_KEY } from "./storage.keys";
import { toStored, fromStored, mergeSettings } from "./storage.adapters";
import { readWithSyncFallback, writeWithSyncFallback } from "./storage.core";
import { loadAllPrompts as loadAllPromptsGranular } from "./storage.prompts";

/** ------------------------
 *  Prompts (compat + migrazione → granulare)
 *  ------------------------ */

export const loadPrompts = async (): Promise<Prompt[]> => {
  return loadAllPromptsGranular();
};

/** ------------------------
 *  Settings 
 *  ------------------------ */

/**
 * Carica le impostazioni dallo storage.
 * @returns Le impostazioni caricate
 */
export async function loadSettings(): Promise<Settings> {
  const stored = await readWithSyncFallback<unknown>(SETTINGS_KEY);
  return fromStored(stored as Partial<ReturnType<typeof toStored>> | undefined);
}

/**
 * Persisti impostazioni:
 * - Se passi una istanza di classe `Settings`, salva così com'è.
 * - Se passi un `Partial<Settings>`, carica l'attuale, fai merge e salva.
 */
export async function persistSettings(settings: Settings | Partial<Settings>) {
  let toSave: Settings;

  if (settings instanceof Settings) {
    // Istanza di classe completa: salvo direttamente
    toSave = settings;
  } else {
    // Patch parziale: leggo stato corrente e faccio merge
    const current = await loadSettings();
    toSave = mergeSettings(current, settings);
  }

  const plain = toStored(toSave);
  await writeWithSyncFallback(SETTINGS_KEY, plain);
}

/** ------------------------
 *  Prompt Sets
 *  ------------------------ */

/**
 * Persisti i PromptSet nello storage (uniforme alle altre persist*).
 */
export const persistPromptSets = async (sets: PromptSet[]) => {
  await writeWithSyncFallback(PROMPT_SETS_KEY, sets);
};

/**
 * Carica i PromptSet dallo storage (uniforme alle altre load*).
 */
export const loadPromptSets = async (): Promise<PromptSet[]> => {
  const loaded = await readWithSyncFallback<PromptSet[]>(PROMPT_SETS_KEY);
  return Array.isArray(loaded) ? loaded : [];
};
