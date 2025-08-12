import React, { useState, useRef, useEffect } from "react"

export interface EllipsisAction {
  key: string
  label: React.ReactNode
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  danger?: boolean
}

interface EllipsisMenuProps {
  actions: EllipsisAction[]
  buttonClassName?: string
  menuClassName?: string
  align?: 'right' | 'left'
  title?: string
  ariaLabel?: string
}

export const EllipsisMenu: React.FC<EllipsisMenuProps> = ({
  actions,
  buttonClassName = 'btn btn--icon',
  menuClassName = 'ellipsis-menu__panel',
  align = 'right',
  title = 'Azioni',
  ariaLabel = 'Menu azioni',
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div ref={ref} className="ellipsis-menu" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={buttonClassName}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        title={title}
      >
        ⋯
      </button>
      {open && (
        <div
          role="menu"
          className={menuClassName}
          style={{
            position: 'absolute',
            top: '100%',
            [align === 'right' ? 'right' : 'left']: 0,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '0.25rem 0',
            minWidth: 150,
            zIndex: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
          } as React.CSSProperties}
        >
          {actions.map(a => (
            <button
              key={a.key}
              role="menuitem"
              disabled={a.disabled}
              onClick={(e) => { a.onClick(e); setOpen(false) }}
              className={`btn menu-item${a.danger ? ' danger' : ''}`}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                color: a.danger && !a.disabled ? '#b00020' : undefined,
                opacity: a.disabled ? 0.6 : 1,
                cursor: a.disabled ? 'not-allowed' : 'pointer'
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default EllipsisMenu
