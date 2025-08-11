import PromptSet from "./PromptSet.tsx"
import type { PromptSet as IPromptSet } from "../../types/PromptSet"
import { useSelector } from "react-redux"
import { promptSelectors } from "../../store/selectors/promptSelectors.ts";


export default function PromptSetList() {
  // Seleziona i PromptSet risolti dallo stato
  // I PromptSet risolti hanno i Prompt risolti
  // (oggetti completi invece che solo id)
  const promptSets: IPromptSet[] = useSelector(promptSelectors.selectResolvedPromptSets);

  return (
    <ul className="prompt-set-list">
      {promptSets.map((set: IPromptSet) => (
        <PromptSet key={set.id} promptSet={set} />
      ))}
    </ul>
  )
}
