import type { RootState } from "../store"
import type { Wassa } from "../../types/Wassa"
import type { WassaSet } from "../../types/WassaSet"

export const selectResolvedWassaSets = (state: RootState): WassaSet[] => {
  const wassas = state.wassas.wassas;
  const byId = new Map<number, Wassa>(wassas.map((w: Wassa) => [Number(w.id), w]))

  return state.wassaSets.sets.map(set => ({
    ...set,
    wassas: set.wassasID
      .map(id => byId.get(Number(id)))
      .filter((w): w is Wassa => Boolean(w)),
  }))
}
