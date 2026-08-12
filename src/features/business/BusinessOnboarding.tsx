import { useState } from 'react'
import type { FormEvent } from 'react'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { BUSINESS_SUBTYPES, BUSINESS_TYPE_INFO } from './businessTypePresets'
import type { BusinessType, NewBusinessInput } from './types'

interface BusinessOnboardingProps {
  onCreate: (input: NewBusinessInput) => Promise<void>
  // Sem onCancel, a tela é obrigatória (ex: primeiro negócio da conta).
  // Com onCancel, aparece um botão de voltar/fechar (ex: "+ Novo negócio"
  // a partir de quem já tem pelo menos um negócio).
  onCancel?: () => void
}

type Step = 'type' | 'details'

// A "ficha inicial" do produto: escolhe o tipo de negócio, depois um
// subtipo sugerido (que decide as categorias de custo pré-preenchidas, ver
// businessTypePresets.ts) e um nome. Tudo isso é só o ponto de partida —
// nada aqui é definitivo, o dono edita à vontade depois.
export function BusinessOnboarding({ onCreate, onCancel }: BusinessOnboardingProps) {
  const [step, setStep] = useState<Step>('type')
  const [businessType, setBusinessType] = useState<BusinessType | null>(null)
  const [businessSubtype, setBusinessSubtype] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function chooseType(type: BusinessType) {
    setBusinessType(type)
    setBusinessSubtype(null)
    setStep('details')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!businessType) return
    setError('')
    setIsSubmitting(true)
    try {
      await onCreate({ name: name.trim(), businessType, businessSubtype })
    } catch (submitError) {
      console.error('Erro ao criar negócio:', submitError)
      setError('Não foi possível salvar seu negócio agora. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-md">
        {onCancel && (
          <button type="button" onClick={onCancel} className="mb-4 text-sm text-slate-600 underline">
            ← Cancelar
          </button>
        )}

        {step === 'type' && (
          <>
            <h1 className="text-xl font-bold text-slate-900">Qual é o seu negócio?</h1>
            <p className="mt-1 text-sm text-slate-600">
              Isso ajuda a gente a sugerir as categorias de custo certas pra você — mas nada aqui é definitivo, dá
              pra ajustar tudo depois.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {(Object.keys(BUSINESS_TYPE_INFO) as BusinessType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => chooseType(type)}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-600 hover:shadow-md"
                >
                  <p className="font-semibold text-slate-900">{BUSINESS_TYPE_INFO[type].title}</p>
                  <p className="mt-1 text-sm text-slate-600">{BUSINESS_TYPE_INFO[type].description}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'details' && businessType && (
          <>
            <button type="button" onClick={() => setStep('type')} className="mb-4 text-sm text-slate-600 underline">
              ← Voltar
            </button>

            <h1 className="text-xl font-bold text-slate-900">Conte um pouco mais</h1>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className={labelClass}>O que mais se parece com o seu negócio?</span>
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_SUBTYPES[businessType].map((subtype) => (
                    <button
                      key={subtype.id}
                      type="button"
                      onClick={() => setBusinessSubtype(subtype.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        businessSubtype === subtype.id
                          ? 'border-emerald-700 bg-emerald-700 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-600'
                      }`}
                    >
                      {subtype.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="business-name" className={labelClass}>
                  Como você quer chamar esse negócio?
                </label>
                <input
                  id="business-name"
                  type="text"
                  required
                  placeholder="Ex: Pipoca do João"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={fieldClass}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <PrimaryButton type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? 'Criando...' : 'Começar'}
              </PrimaryButton>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
