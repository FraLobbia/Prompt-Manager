export const VIEWS = {
  settings: "settings",
  activeSet: "activeSet",
  newPrompt: "newPrompt",
  newSet: "newSet",
  editPrompt: "editPrompt",
  editSet: "editSet",
  chooseSet: "chooseSet",
} as const;

export type ViewName = keyof typeof VIEWS;
export type ViewValue = (typeof VIEWS)[ViewName];
