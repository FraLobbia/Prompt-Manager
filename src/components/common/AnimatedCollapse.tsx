import React, { useEffect, useRef, useState } from "react"

interface AnimatedCollapseProps {
  open: boolean
  children: React.ReactNode
  className?: string
  durationMs?: number // opzionale per override transizione via inline style
}

// Componente riutilizzabile per animare espansione/collasso basato su max-height
// Usa misurazione dinamica dell'altezza del contenuto per ottenere transizioni fluide di altezza variabile.
export default function AnimatedCollapse({ open, children, className = "", durationMs }: AnimatedCollapseProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState(0)

  /**
   * Misura l'altezza ogni volta che open cambia o i children cambiano 
   * (nel caso cambi la dimensione interna)
   */
  useEffect(() => {
    if (containerRef.current) {
      const content = containerRef.current.firstElementChild as HTMLElement | null
      if (content) {
        setHeight(content.scrollHeight)

      }
    }
  }, [open, children])

  /**
   * Aggiorna altezza anche on resize (facoltativo per resilienza layout)
   */
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const content = containerRef.current.firstElementChild as HTMLElement | null
        if (content) {
          setHeight(content.scrollHeight)
        }
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`collapse ${open ? 'is-open' : ''} ${className}`.trim()}
      style={{ maxHeight: open ? height : 0, ...(durationMs ? { transitionDuration: `${durationMs}ms` } : {}) }}
      aria-hidden={!open}
    >
      {children}
    </div>
  )
}
