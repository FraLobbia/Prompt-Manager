import React, { useEffect, useRef, useState } from "react"

/** Azione del menu a tre puntini. */
export interface EllipsisAction {
  /** Identificatore univoco dell’azione. */
  key: string
  /** Contenuto visivo dell’azione (testo/icone). */
  label: React.ReactNode
  /** Handler di click. */
  onClick: (e: React.MouseEvent) => void
  /** Se true, disabilita l’azione. */
  disabled?: boolean
  /** Se true, stile “pericoloso” (es. elimina). */
  danger?: boolean
}

/** Proprietà del componente EllipsisMenu. */
export interface EllipsisMenuProps {
  /** Elenco azioni da mostrare nel pannello. */
  actions: EllipsisAction[]
  /** Classe extra per il bottone trigger. */
  buttonClassName?: string
  /** Classe extra per il pannello (oltre a quelle interne). */
  menuClassName?: string
  /** Allineamento del pannello rispetto al trigger. */
  align?: "right" | "left"
  /** Tooltip del bottone trigger. */
  title?: string
  /** Etichetta ARIA per accessibilità. */
  ariaLabel?: string
}

/**
 * Menu a tre puntini con pannello “invisibile”:
 * il contenitore del menu è trasparente, solo gli item sono cliccabili.
 * Richiede gli stili SCSS correlati (panel trasparente, item fluttuanti).
 */
export const EllipsisMenu: React.FC<EllipsisMenuProps> = ({
  actions,
  buttonClassName = "btn btn--icon",
  menuClassName = "",
  align = "right",
  title = "Azioni",
  ariaLabel = "Menu azioni",
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  // Chiude al click fuori o su ESC
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="ellipsis-menu">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`ellipsis-menu__trigger ${buttonClassName}`.trim()}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        title={title}
      >
        ⋯
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={[
          "ellipsis-menu__panel",
          `align-${align}`,
          open ? "is-open" : "",
          menuClassName,
        ].join(" ").trim()}
      >
        {actions.map((a) => (
          <button
            key={a.key}
            role="menuitem"
            disabled={a.disabled}
            onClick={(e) => {
              a.onClick(e)
              setOpen(false)
            }}
            className={[
              "ellipsis-menu__item",
              "btn",
              "menu-item",
              a.danger ? "ellipsis-menu__item--danger" : "",
            ].join(" ").trim()}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EllipsisMenu
