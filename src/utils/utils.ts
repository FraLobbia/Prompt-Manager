import { loadSettings, loadWassas, persistSettings, persistWassas, loadWassaSets, persistWassaSets } from "../persistence/storage";
import { setWassas } from "../store/slices/wassaSlice";
import { setWassaSets } from "../store/slices/wassaSetsSlice";
import { setClipboardReplace, setButtonNumberClass } from "../store/slices/settingsSlice";
import type { Dispatch } from "redux";

export async function exportBackup() {
  const settings = await loadSettings();
  const wassas = await loadWassas();
  const wassaSets = await loadWassaSets();
  const backup = { settings, wassas, wassaSets };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wassà-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File, dispatch: Dispatch) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const { settings, wassas, wassaSets } = JSON.parse(text);
        if (settings) {
          await persistSettings(settings);
          dispatch(setClipboardReplace(settings.clipboardReplace ?? true));
          dispatch(setButtonNumberClass(settings.buttonNumberClass ?? "53"));
        }
        if (wassas) {
          await persistWassas(wassas);
          dispatch(setWassas(wassas));
        }
        if (wassaSets) {
          await persistWassaSets(wassaSets);
          dispatch(setWassaSets(wassaSets));
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
