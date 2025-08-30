// src/persistence/storage.import.ts
import { persistSettings, loadPrompts, loadPromptSets, persistPromptSets } from "./storage";
import { upsertPrompt, overwriteAllPrompts } from "./storage.prompts";
import type { Settings } from "../types/Settings";
import type { Prompt } from "../types/Prompt";
import type { PromptSet } from "../types/PromptSet";

/** Flag globale: true = sovrascrivi, false = aggiungi soltanto */
export const OVERWRITE_ON_IMPORT = false;

export type ImportPayload = {
  settings?: Partial<Settings> | Settings;
  prompts?: Prompt[];
  promptSets?: PromptSet[];
};

/**
 * Import JSON con comportamento parametrico.
 * - overwrite=true: rimozione dei Prompt assenti + riscrittura totale.
 * - overwrite=false: add-only su Prompt/PromptSet; settings ignorate.
 */
export async function importBackup(payload: ImportPayload, overwrite: boolean = OVERWRITE_ON_IMPORT): Promise<void> {
  if (!payload || typeof payload !== "object") throw new Error("Payload di import non valido.");

  // SETTINGS
  if (payload.settings && overwrite) {
    await persistSettings(payload.settings as Settings | Partial<Settings>);
  }

  // PROMPTS
  if (Array.isArray(payload.prompts)) {
    if (overwrite) {
      await overwriteAllPrompts(payload.prompts);
    } else {
      const existing = await loadPrompts();
      const existingIds = new Set(existing.map(p => p.id));
      const onlyNew = payload.prompts.filter(p => !existingIds.has(p.id));
      for (const p of onlyNew) await upsertPrompt(p);
    }
  }

  // PROMPT SETS
  if (Array.isArray(payload.promptSets)) {
    if (overwrite) {
      await persistPromptSets(payload.promptSets);
    } else {
      const existing = await loadPromptSets();
      const byId = new Map(existing.map(s => [s.id, s] as const));
      for (const s of payload.promptSets) if (!byId.has(s.id)) byId.set(s.id, s);
      await persistPromptSets(Array.from(byId.values()));
    }
  }
}

/** Helper: importa da stringa JSON. */
export async function importBackupFromString(jsonString: string, overwrite?: boolean): Promise<void> {
  return importBackup(JSON.parse(jsonString) as ImportPayload, overwrite ?? OVERWRITE_ON_IMPORT);
}
