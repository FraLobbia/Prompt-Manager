import { loadSettings, loadWassas, persistSettings, persistWassas } from "../persistence/storage";
import { setWassas } from "../store/slices/wassaSlice";
import { setUseClipboard, setButtonNumberClass } from "../store/slices/settingsSlice";
import type { Dispatch } from "redux";

export async function exportBackup() {
  const settings = await loadSettings();
  const wassas = await loadWassas();
  const backup = { settings, wassas };
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
        const { settings, wassas } = JSON.parse(text);
        if (settings) {
          await persistSettings(settings);
          dispatch(setUseClipboard(settings.useClipboard ?? true));
          dispatch(setButtonNumberClass(settings.buttonNumberClass ?? "53"));
        }
        if (wassas) {
          await persistWassas(wassas);
          dispatch(setWassas(wassas));
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
