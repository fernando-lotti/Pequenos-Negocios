import { useState } from 'react'
import { CONCEPT_TIPS } from './tips'

interface InfoTooltipProps {
  conceptId: string
}

// Ícone "i" clicável que mostra a dica de um conceito sob demanda — diferente
// do ConceptTip.tsx, que aparece sozinho na primeira vez e some pra sempre
// depois de fechado. Este aqui fica sempre disponível, pra quem quiser
// reler a explicação (ex: legenda de "Custo fixo" / "Custo variável" no
// gerenciador de categorias).
export function InfoTooltip({ conceptId }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tip = CONCEPT_TIPS[conceptId]
  if (!tip) return null

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={tip.title}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 text-[10px] font-semibold leading-none text-slate-500 hover:border-emerald-600 hover:text-emerald-700"
      >
        i
      </button>
      {isOpen && (
        <span className="absolute left-0 top-6 z-10 w-64 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left text-xs text-emerald-900 shadow-lg">
          <span className="block font-semibold">{tip.title}</span>
          <span className="mt-1 block">{tip.body}</span>
        </span>
      )}
    </span>
  )
}
