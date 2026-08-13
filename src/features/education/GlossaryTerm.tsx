import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CONCEPT_TIPS } from './tips'

interface GlossaryTermProps {
  conceptId: string
  children: ReactNode
}

// Destaca uma palavra ou expressão do glossário (ex: "margem", "custo
// fixo") em outra cor e sublinhado, mostrando um balãozinho com a
// explicação ao clicar — mesmo balão do InfoTooltip.tsx, mas aqui o
// próprio texto é o gatilho, pra deixar visível que aquele termo pode
// ser clicado (ver pedido de "palavras-chave clicáveis" no PR).
export function GlossaryTerm({ conceptId, children }: GlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const tip = CONCEPT_TIPS[conceptId]

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Sem dica cadastrada pra esse id, mostra só o texto normal — mesma
  // proteção do InfoTooltip.tsx.
  if (!tip) return <>{children}</>

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={tip.title}
        className="font-medium text-emerald-700 underline decoration-emerald-400 decoration-dotted underline-offset-2 hover:text-emerald-800"
      >
        {children}
      </button>
      {isOpen && (
        <span className="absolute left-0 top-6 z-10 w-64 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left text-xs font-normal normal-case text-emerald-900 shadow-lg">
          <span className="block font-semibold">{tip.title}</span>
          <span className="mt-1 block">{tip.body}</span>
        </span>
      )}
    </span>
  )
}
