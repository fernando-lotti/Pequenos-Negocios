import { useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { GlossaryTerm } from '../education/GlossaryTerm'
import type { NewPaymentMethodInput, PaymentMethod } from './types'

interface PaymentMethodManagerProps {
  paymentMethods: PaymentMethod[]
  // Ids de forma de pagamento que já têm pelo menos um lançamento de
  // receita — usado só pra decidir o aviso ao excluir (mesmo padrão de
  // CostCategoryManager.tsx).
  usedPaymentMethodIds: Set<string>
  onCreate: (input: NewPaymentMethodInput) => Promise<unknown>
  onUpdate: (id: string, input: NewPaymentMethodInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

// Gerenciador de formas de pagamento: o preset inicial (Pix, Débito,
// Crédito...) é só um ponto de partida com taxas de referência (ver
// defaultPaymentMethods.ts) — aqui o dono ajusta a taxa real da própria
// maquininha/banco, ou cria/exclui formas de pagamento livremente.
export function PaymentMethodManager({
  paymentMethods,
  usedPaymentMethodIds,
  onCreate,
  onUpdate,
  onDelete,
}: PaymentMethodManagerProps) {
  const [newName, setNewName] = useState('')
  const [newFeeText, setNewFeeText] = useState('0')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingFeeText, setEditingFeeText] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Ver comentário equivalente em CostCategoryManager.tsx sobre por que o
  // aviso de confirmação fica na própria tela, em vez de window.confirm().
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!newName.trim()) return
    setIsSubmitting(true)
    setError('')
    try {
      await onCreate({ name: newName.trim(), feePercent: Number(newFeeText) || 0 })
      setNewName('')
      setNewFeeText('0')
    } catch (createError) {
      console.error('Erro ao criar forma de pagamento:', createError)
      setError('Não foi possível criar essa forma de pagamento agora. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEditing(method: PaymentMethod) {
    setEditingId(method.id)
    setEditingName(method.name)
    setEditingFeeText(String(method.feePercent))
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
  }

  async function saveEditing(id: string) {
    if (!editingName.trim()) return
    setError('')
    try {
      await onUpdate(id, { name: editingName.trim(), feePercent: Number(editingFeeText) || 0 })
      setEditingId(null)
    } catch (updateError) {
      console.error('Erro ao editar forma de pagamento:', updateError)
      setError('Não foi possível salvar essa edição agora. Tente novamente.')
    }
  }

  function handleDeleteClick(method: PaymentMethod) {
    setError('')
    if (usedPaymentMethodIds.has(method.id)) {
      setConfirmingDeleteId(method.id)
    } else {
      onDelete(method.id).catch((deleteError) => {
        console.error('Erro ao excluir forma de pagamento:', deleteError)
        setError('Não foi possível excluir essa forma de pagamento agora. Tente novamente.')
      })
    }
  }

  async function confirmDelete(id: string) {
    setError('')
    try {
      await onDelete(id)
      setConfirmingDeleteId(null)
    } catch (deleteError) {
      console.error('Erro ao excluir forma de pagamento:', deleteError)
      setError('Não foi possível excluir essa forma de pagamento agora. Tente novamente.')
    }
  }

  return (
    <Card>
      <p className="font-semibold text-slate-900">Formas de pagamento</p>
      <p className="mt-1 text-sm text-slate-500">
        A <GlossaryTerm conceptId="taxa_de_pagamento">taxa</GlossaryTerm> é descontada automaticamente do seu lucro
        quando você escolher essa forma de pagamento numa receita.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-3 flex flex-col gap-2">
        {paymentMethods.map((method) => {
          if (editingId === method.id) {
            return (
              <li key={method.id} className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                <input
                  autoFocus
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  className={fieldClass}
                />
                <div className="flex flex-col gap-1">
                  <span className={labelClass}>Taxa (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    step="0.1"
                    value={editingFeeText}
                    onChange={(event) => setEditingFeeText(event.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="flex gap-2">
                  <PrimaryButton type="button" onClick={() => saveEditing(method.id)} disabled={!editingName.trim()}>
                    Salvar
                  </PrimaryButton>
                  <PrimaryButton type="button" variant="secondary" onClick={cancelEditing}>
                    Cancelar
                  </PrimaryButton>
                </div>
              </li>
            )
          }

          if (confirmingDeleteId === method.id) {
            return (
              <li key={method.id} className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-900">
                  Excluir "{method.name}"? Ela já tem lançamento de receita. Esses lançamentos não serão apagados, mas
                  vão ficar sem forma de pagamento até você editá-los e escolher outra.
                </p>
                <div className="flex gap-2">
                  <PrimaryButton type="button" variant="danger" onClick={() => confirmDelete(method.id)}>
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
            <li key={method.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-sm text-slate-900">
                {method.name}
                <span className="ml-2 text-xs text-slate-500">
                  {method.feePercent > 0 ? `${method.feePercent}% de taxa` : 'sem taxa'}
                </span>
              </p>

              <div className="flex shrink-0 items-center gap-3">
                <button type="button" onClick={() => startEditing(method)} className="text-xs text-slate-600 underline">
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(method)}
                  aria-label={`Excluir forma de pagamento ${method.name}`}
                  className="text-xs text-red-600 underline"
                >
                  Excluir
                </button>
              </div>
            </li>
          )
        })}
        {paymentMethods.length === 0 && <p className="text-sm text-slate-500">Nenhuma forma de pagamento ainda.</p>}
      </ul>

      <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nova forma de pagamento (ex: Crédito 2x)"
          className={fieldClass}
        />

        <div className="flex flex-col gap-1">
          <span className={labelClass}>Taxa (%)</span>
          <input
            type="number"
            min="0"
            max="99"
            step="0.1"
            value={newFeeText}
            onChange={(event) => setNewFeeText(event.target.value)}
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
