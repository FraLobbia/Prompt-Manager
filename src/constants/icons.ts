export const ICONS = {
  close: "❌",
  settings: "⚙️",
  add: "➕",
  overwrite: "🔄",
  edit: "✏️",
  delete: "🗑",
  active: "✅",
  save: "💾",
} as const;

// Tipo dei nomi ricavato automaticamente
export type IconName = keyof typeof ICONS;

// Chiavi “sicure” (K: K) derivate da ICONS
export const ICON_KEY = Object.fromEntries(
  (Object.keys(ICONS) as IconName[]).map(k => [k, k])
) as { [K in IconName]: K };

// Accessor tipizzato
export function getIcon<N extends IconName>(name: N): (typeof ICONS)[N] {
  return ICONS[name];
}