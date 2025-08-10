import type { Wassa } from "./Wassa"

export interface WassaSet {
  id: string
  titolo: string
  descrizione: string
  wassasID: number[]
  wassas?: Wassa[]
}
