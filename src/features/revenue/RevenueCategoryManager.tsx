import { useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass } from '../../components/Field'
import type { RevenueCategory } from './types'

interface RevenueCategoryManagerProps {
  categories: RevenueCategory[]
  // Ids de categoria que já têm pelo menos um lançamento — usado só pra
  // decidir o aviso ao excluir (ver handleDelete).
  usedCategoryIds: Set<string>
  onCreate: (input: { name: string }) => Promise<unknown>
  onUpdate: (id: string, input: { name: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

// Gerenciador de categorias de receita: diferente de categoria de custo,
// não tem "tipo" — é só um rótulo livre pra separar de onde vem o dinheiro
// (ex: "Pipoca doce", "Pipoca salgada"). O preset inicial (ver
// businessTypePresets.ts) é só ponto de partida, totalmente editável.
export function RevenueCategoryManager({ categories, usedCategoryIds, onCreate, onUpdate, onDelete }: RevenueCategoryManagerProps) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
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
      await onCreate({ name: newName.trim() })
      setNewName('')
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
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
  }

  async function saveEditing(id: string) {
    if (!editingName.trim()) return
    setError('')
    try {
      await onUpdate(id, { name: editingName.trim() })
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
      <p className="font-semibold text-slate-900">Categorias de receita</p>
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
              <p className="text-sm text-slate-900">{category.name}</p>

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
        {categories.length === 0 && <p className="text-sm text-slate-500">Nenhuma categoria ainda.</p>}
      </ul>

      <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nova categoria (ex: Pipoca doce)"
          className={fieldClass}
        />

        <PrimaryButton type="submit" variant="secondary" disabled={isSubmitting || !newName.trim()}>
          Adicionar
        </PrimaryButton>
      </form>
    </Card>
  )
}
