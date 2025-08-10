import type { RootState } from "../store"
import type { Wassa } from "../../types/Wassa"
import type { WassaSet } from "../../types/WassaSet"

export type ResolvedWassaSet = Omit<WassaSet, "wassasID"> & { wassas: Wassa[] }

export const selectResolvedWassaSets = (state: RootState): ResolvedWassaSet[] => {
  const allWassas = Object.values(state.wassas.wassas) as Wassa[]
  const byId = new Map<number, Wassa>(allWassas.map((w: Wassa) => [Number(w.id), w]))

  return state.wassaSets.sets.map(set => ({
    ...set,
    wassas: set.wassasID
      .map(id => byId.get(Number(id)))
      .filter((w): w is Wassa => Boolean(w)),
  }))
}
