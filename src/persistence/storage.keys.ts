// src/persistence/storage.keys.ts

/** Chiavi di storage */
export const SETTINGS_KEY = "settings";

// New canonical keys
export const PROMPTS_KEY = "prompts";
export const PROMPT_SETS_KEY = "promptSets";

/** Schema granulare per Prompt */
export const PROMPTS_INDEX_KEY = "prompts:index";
export const promptByIdKey = (id: string) => `prompts:byId:${id}`;
