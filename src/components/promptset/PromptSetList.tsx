import PromptSet from "./PromptSet.tsx"
import type { PromptSet as IPromptSet } from "../../types/PromptSet"
import { useSelector } from "react-redux"
import { promptSelectors } from "../../store/selectors/promptSelectors.ts";
import { useSettings } from "../../store/hooks"
import { VIEWS } from "../../constants/views"

export default function PromptSetList() {
  // Seleziona i PromptSet risolti dallo stato
  // I PromptSet risolti hanno i Prompt risolti
  // (oggetti completi invece che solo id)
  const promptSets: IPromptSet[] = useSelector(promptSelectors.selectResolvedPromptSets);
  const { activeSet, setActiveSet, navigate } = useSettings()

  return (
    <ul>
      {promptSets.map((set: IPromptSet) => {
        const isActive = set.id === activeSet
        const isDefault = set.id === 'default'
        return (
          <li
            key={set.id}
            onClick={() => {
              if (isActive) {
                navigate(VIEWS.activeSet)
              } else {
                setActiveSet(set.id)
              }
            }}
            title={isActive ? 'Clic per andare alla lista dei prompt' : 'Clic per rendere attivo'}
          >
            <div className={`card flex-row prompt-set-list__item m-3${isActive ? ' prompt-set--active' : ''}${isDefault ? ' prompt-set--default' : ''}`}>
              <img className="prompt-set-list__item-image" src="/images/prompt-set-icon.jpeg" alt="immagine rappresentativa del set di prompt" />
              <PromptSet promptSet={set} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
