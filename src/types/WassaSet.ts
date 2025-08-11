import type { Wassa } from "./Wassa"

export interface WassaSet {
  id: string
  titolo: string
  descrizione: string
  wassasID: string[]
  wassas?: Wassa[]
}

// Default set always present in the app
export const DEFAULT_WASSA_SET_ID = "default"
export const DEFAULT_WASSA_SET_TITLE = "Default"
export const DEFAULT_WASSA_SET: WassaSet = {
  id: DEFAULT_WASSA_SET_ID,
  titolo: DEFAULT_WASSA_SET_TITLE,
  descrizione: "",
  wassasID: [],
}
