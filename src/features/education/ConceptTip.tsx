import { useConceptTip } from './useConceptTip'

interface ConceptTipProps {
  conceptId: string
}

export function ConceptTip({ conceptId }: ConceptTipProps) {
  const { tip, isVisible, dismiss } = useConceptTip(conceptId)
  if (!tip || !isVisible) return null

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
      <div>
        <p className="font-semibold">{tip.title}</p>
        <p className="mt-1">{tip.body}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Entendi, fechar dica"
        className="shrink-0 text-emerald-700/70 hover:text-emerald-900"
      >
        ✕
      </button>
    </div>
  )
}
