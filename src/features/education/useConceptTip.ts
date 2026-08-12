import { useState } from 'react'
import { CONCEPT_TIPS } from './tips'

const STORAGE_PREFIX = 'concept_tip_seen_'

// "Visto" fica em localStorage por conceito (não por negócio) — é um
// aprendizado da pessoa, não um dado do negócio (ver ADR "Dicas educativas
// por conceito" em docs/ARCHITECTURE.md).
export function useConceptTip(conceptId: string) {
  const tip = CONCEPT_TIPS[conceptId]
  const storageKey = STORAGE_PREFIX + conceptId
  const [isVisible, setIsVisible] = useState(() => {
    if (!tip) return false
    return localStorage.getItem(storageKey) !== 'true'
  })

  function dismiss() {
    localStorage.setItem(storageKey, 'true')
    setIsVisible(false)
  }

  return { tip, isVisible, dismiss }
}
