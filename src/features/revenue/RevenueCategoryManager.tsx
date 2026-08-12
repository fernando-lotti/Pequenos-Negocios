import { useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { centsToAmountInputText, formatCurrencyBRL, parseTypedAmountToCents } from '../../lib/currency'
import type { RevenueCategory } from './types'

interface RevenueCategoryInput {
  name: string
  unitCostCents?: number | null
}

interface RevenueCategoryManagerProps {
  categories: RevenueCategory[]
  // Ids de categoria que já têm pelo menos um lançamento — usado só pra
  // decidir o aviso ao excluir (ver handleDelete).
  usedCategoryIds: Set<string>
  onCreate: (input: RevenueCategoryInput) => Promise<unknown>
  onUpdate: (id: string, input: RevenueCategoryInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
  // "Produto" pra negócio comerciante de produto, "Categoria de receita"
  // pra prestador de serviços — mesmo padrão de copy contextual já usado em
  // BUSINESS_TYPE_INFO (ver businessTypePresets.ts). Não muda nenhum dado,
  // só como a tela chama a mesma coisa.
  labelSingular: string
}

// Gerenciador de categorias de receita: diferente de categoria de custo,
// não tem "tipo", mas tem um custo por unidade opcional — quando
// preenchido, vira um "produto" com margem individual calculável (ver
// reports/ProductMarginCard.tsx). O preset inicial (ver
// businessTypePresets.ts) é só ponto de partida, totalmente editável.
export function RevenueCategoryManager({
  categories,
  usedCategoryIds,
  onCreate,
  onUpdate,
  onDelete,
  labelSingular,
}: RevenueCategoryManagerProps) {
  const [newName, setNewName] = useState('')
  const [newCostText, setNewCostText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingCostText, setEditingCostText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Ver comentário equivalente em CostCategoryManager.tsx sobre por que não
  // usamos window.confirm() aqui (PWA instalado ignora confirm() no iOS).
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!newName.trim()) return
    setIsSubmitting(true)
    setError('')
    try {
      await onCreate({ name: newName.trim(), unitCostCents: parseTypedAmountToCents(newCostText) })
      setNewName('')
      setNewCostText('')
    } catch (createError) {
      console.error('Erro ao criar categoria:', createError)
      setError('Não foi possível criar essa categoria agora. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEditing(category: RevenueCategory) {
    setEditingId(category.id)
    setEditingName(category.name)
    setEditingCostText(category.unitCostCents ? centsToAmountInputText(category.unitCostCents) : '')
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
  }

  async function saveEditing(id: string) {
    if (!editingName.trim()) return
    setError('')
    try {
      await onUpdate(id, { name: editingName.trim(), unitCostCents: parseTypedAmountToCents(editingCostText) })
      setEditingId(null)
    } catch (updateError) {
      console.error('Erro ao editar categoria:', updateError)
      setError('Não foi possível salvar essa edição agora. Tente novamente.')
    }
  }

  function handleDeleteClick(category: RevenueCategory) {
    setError('')
    if (usedCategoryIds.has(category.id)) {
      setConfirmingDeleteId(category.id)
    } else {
      onDelete(category.id).catch((deleteError) => {
        console.error('Erro ao excluir categoria:', deleteError)
        setError('Não foi possível excluir essa categoria agora. Tente novamente.')
      })
    }
  }

  async function confirmDelete(id: string) {
    setError('')
    try {
      await onDelete(id)
      setConfirmingDeleteId(null)
    } catch (deleteError) {
      console.error('Erro ao excluir categoria:', deleteError)
      setError('Não foi possível excluir essa categoria agora. Tente novamente.')
    }
  }

  return (
    <Card>
      <p className="font-semibold text-slate-900">{labelSingular}s</p>
      <p className="mt-1 text-sm text-slate-500">
        Cadastre um custo por unidade pra ver a margem de cada {labelSingular.toLowerCase()} em Relatórios.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-3 flex flex-col gap-2">
        {categories.map((category) => {
          if (editingId === category.id) {
            return (
              <li key={category.id} className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                <input
                  autoFocus
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className={fieldClass}
                />
                <div className="flex flex-col gap-1">
                  <span className={labelClass}>Custo por unidade (opcional)</span>
                  <input
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={editingCostText}
                    onChange={(event) =>
                      setEditingCostText(centsToAmountInputText(parseTypedAmountToCents(event.target.value) ?? 0))
                    }
                    className={fieldClass}
                  />
                </div>
                <div className="flex gap-2">
                  <PrimaryButton type="button" onClick={() => saveEditing(category.id)} disabled={!editingName.trim()}>
                    Salvar
                  </PrimaryButton>
                  <PrimaryButton type="button" variant="secondary" onClick={cancelEditing}>
                    Cancelar
                  </PrimaryButton>
                </div>
              </li>
            )
          }

          if (confirmingDeleteId === category.id) {
            return (
              <li key={category.id} className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-900">
                  Excluir "{category.name}"? Ela já tem lançamento de receita. Esses lançamentos não serão apagados, mas
                  vão ficar sem categoria até você editá-los e escolher outra.
                </p>
                <div className="flex gap-2">
                  <PrimaryButton type="button" variant="danger" onClick={() => confirmDelete(category.id)}>
                    Excluir mesmo assim
                  </PrimaryButton>
                  <PrimaryButton type="button" variant="secondary" onClick={() => setConfirmingDeleteId(null)}>
                    Cancelar
                  </PrimaryButton>
                </div>
              </li>
            )
          }

          return (
            <li
              key={category.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
            >
              <p className="text-sm text-slate-900">
                {category.name}
                {category.unitCostCents !== null && (
                  <span className="ml-2 text-xs text-slate-500">custo: {formatCurrencyBRL(category.unitCostCents)}</span>
                )}
              </p>

              <div className="flex shrink-0 items-center gap-3">
                <button type="button" onClick={() => startEditing(category)} className="text-xs text-slate-600 underline">
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(category)}
                  aria-label={`Excluir categoria ${category.name}`}
                  className="text-xs text-red-600 underline"
                >
                  Excluir
                </button>
              </div>
            </li>
          )
        })}
        {categories.length === 0 && <p className="text-sm text-slate-500">Nenhum(a) {labelSingular.toLowerCase()} ainda.</p>}
      </ul>

      <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder={`Novo(a) ${labelSingular.toLowerCase()} (ex: Pipoca doce)`}
          className={fieldClass}
        />

        <div className="flex flex-col gap-1">
          <span className={labelClass}>Custo por unidade (opcional)</span>
          <input
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={newCostText}
            onChange={(event) => setNewCostText(centsToAmountInputText(parseTypedAmountToCents(event.target.value) ?? 0))}
            className={fieldClass}
          />
        </div>

        <PrimaryButton type="submit" variant="secondary" disabled={isSubmitting || !newName.trim()}>
          Adicionar
        </PrimaryButton>
      </form>
    </Card>
  )
}
