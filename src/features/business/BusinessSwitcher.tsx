import { useState } from 'react'
import { BusinessOnboarding } from './BusinessOnboarding'
import type { Business, NewBusinessInput } from './types'

interface BusinessSwitcherProps {
  businesses: Business[]
  activeBusiness: Business
  onSelect: (id: string) => void
  onCreate: (input: NewBusinessInput) => Promise<void>
}

// Seletor do negócio ativo, sempre visível quando a pessoa tem mais de um
// negócio cadastrado — mais o fluxo de criar um segundo (terceiro, etc.)
// negócio, reaproveitando a mesma ficha inicial (ver ADR "Multi-negócio é
// first-class na UI" em docs/ARCHITECTURE.md).
export function BusinessSwitcher({ businesses, activeBusiness, onSelect, onCreate }: BusinessSwitcherProps) {
  const [isCreating, setIsCreating] = useState(false)

  if (isCreating) {
    return (
      <BusinessOnboarding
        onCancel={() => setIsCreating(false)}
        onCreate={async (input) => {
          await onCreate(input)
          setIsCreating(false)
        }}
      />
    )
  }

  return (
    <div className="flex items-center gap-2">
      {businesses.length > 1 ? (
        <select
          value={activeBusiness.id}
          onChange={(event) => onSelect(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
        >
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-sm font-semibold text-slate-900">{activeBusiness.name}</span>
      )}

      <button
        type="button"
        onClick={() => setIsCreating(true)}
        title="Adicionar outro negócio"
        className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:border-emerald-600 hover:text-emerald-700"
      >
        + Novo negócio
      </button>
    </div>
  )
}
