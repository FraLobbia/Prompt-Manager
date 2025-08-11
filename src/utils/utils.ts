import { loadSettings, loadPrompts, persistSettings, persistPrompts, loadPromptSets, persistPromptSets } from "../persistence/storage";
import { setPrompts } from "../store/slices/promptSlice";
import { setPromptSets } from "../store/slices/promptSetsSlice";
import { setClipboardReplace, setButtonNumberClass } from "../store/slices/settingsSlice";
import type { Dispatch } from "redux";

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

export async function importBackup(file: File, dispatch: Dispatch) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const settings = parsed.settings;
        const prompts = parsed.prompts;
        const promptSets = parsed.promptSets;
        if (settings) {
          await persistSettings(settings);
          dispatch(setClipboardReplace(settings.clipboardReplace ?? true));
          dispatch(setButtonNumberClass(settings.buttonNumberClass ?? "53"));
        }
        if (prompts) {
          await persistPrompts(prompts);
          dispatch(setPrompts(prompts));
        }
        if (promptSets) {
          await persistPromptSets(promptSets);
          dispatch(setPromptSets(promptSets));
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
