import { useState } from 'react'
import { fieldClass, labelClass } from '../../components/Field'
import { ConceptTip } from '../education/ConceptTip'
import { TAX_REGIME_LABELS } from './types'
import type { Business, TaxRegime } from './types'

const NOT_INFORMED_VALUE = ''

interface TaxRegimeFieldProps {
  business: Business
  onSave: (businessId: string, taxRegime: TaxRegime | null) => Promise<unknown>
}

// Campo só informativo por enquanto (ver ADR em docs/ARCHITECTURE.md) — não
// afeta nenhum cálculo do app. Salva assim que a pessoa troca a opção, sem
// botão de "Salvar" à parte: é um único campo, não um formulário.
export function TaxRegimeField({ business, onSave }: TaxRegimeFieldProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(value: string) {
    setError('')
    setIsSaving(true)
    try {
      await onSave(business.id, value === NOT_INFORMED_VALUE ? null : (value as TaxRegime))
    } catch (saveError) {
      console.error('Erro ao salvar regime tributário:', saveError)
      setError('Não foi possível salvar agora. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3">
      <label htmlFor="tax-regime" className={labelClass}>
        Regime tributário
      </label>
      <select
        id="tax-regime"
        value={business.taxRegime ?? NOT_INFORMED_VALUE}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isSaving}
        className={fieldClass}
      >
        <option value={NOT_INFORMED_VALUE}>Não informado</option>
        {(Object.keys(TAX_REGIME_LABELS) as TaxRegime[]).map((regime) => (
          <option key={regime} value={regime}>
            {TAX_REGIME_LABELS[regime]}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="mt-1">
        <ConceptTip conceptId="regime_tributario" />
      </div>
    </div>
  )
}
