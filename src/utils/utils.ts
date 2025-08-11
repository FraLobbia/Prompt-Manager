// src/utils/utils.ts
import { loadSettings, loadPrompts, persistSettings, loadPromptSets, persistPromptSets } from "../persistence/storage";
import { migratePromptsIfNeeded } from "../persistence/storage.prompts"; // ✅ nuovo: migrazione/scrittura granulare
import { setPrompts } from "../store/slices/promptSlice";
import { setPromptSets } from "../store/slices/promptSetsSlice";
import { setClipboardReplace, setButtonNumberClass } from "../store/slices/settingsSlice";
import type { Dispatch } from "redux";
import type { PromptSet } from "../types/PromptSet";
import type { Prompt } from "../types/Prompt";

/** Esporta un backup completo (settings + prompts + promptSets) come file JSON */
export async function exportBackup() {
  const settings = await loadSettings();
  const prompts = await loadPrompts();
  const promptSets = await loadPromptSets();

  const backup = { settings, prompts, promptSets };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "prompt-backup.json";
  a.click();

  URL.revokeObjectURL(url);
}

/** Importa un backup JSON e idrata store + storage
 *  - Settings: persist + dispatch patch locale essenziale
 *  - Prompts: migrazione allo schema granulare (index + byId) + dispatch in store
 *  - PromptSets: persist blob + dispatch in store
 */
export async function importBackup(file: File, dispatch: Dispatch) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = String(event.target?.result ?? "");
        const parsed = JSON.parse(text) as {
          settings?: { clipboardReplace?: boolean; buttonNumberClass?: string };
          prompts?: unknown[]; // verrà passato alla migrazione
          promptSets?: unknown[]; // delegato al persistPromptSets
        };

        const settings = parsed.settings;
        const prompts = parsed.prompts;
        const promptSets = parsed.promptSets;

        // Settings: salva e applica le parti necessarie allo store
        if (settings) {
          await persistSettings(settings);
          dispatch(setClipboardReplace(settings.clipboardReplace ?? true));
          dispatch(setButtonNumberClass(settings.buttonNumberClass ?? "53"));
        }

        // Prompts: usa schema granulare (migrazione 1:1: indice + byId)
        if (Array.isArray(prompts)) {
          await migratePromptsIfNeeded(prompts as Prompt[]); // scrive index + singoli prompt
          // Aggiorna lo store con quanto importato
          // (setPrompts accetta Prompt[]; assume che i dati del backup siano coerenti)
          dispatch(setPrompts(prompts as Prompt[]));
        }

        // PromptSets: restano persistiti come blob
        if (Array.isArray(promptSets)) {
          await persistPromptSets(promptSets as PromptSet[]);
          dispatch(setPromptSets(promptSets as PromptSet[]));
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}
