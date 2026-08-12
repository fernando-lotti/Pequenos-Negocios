import { useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass } from '../../components/Field'
import { InfoTooltip } from '../education/InfoTooltip'
import { COST_KIND_LABELS } from './types'
import type { CostCategory, CostKind } from './types'

interface CostCategoryManagerProps {
  categories: CostCategory[]
  onCreate: (input: { name: string; kind: CostKind }) => Promise<unknown>
  onRename: (id: string, name: string) => Promise<void>
  onSetActive: (id: string, isActive: boolean) => Promise<void>
}

// Gerenciador de categorias de custo: a ficha inicial só sugere um ponto de
// partida (ver businessTypePresets.ts) — aqui o usuário cria, renomeia e
// desativa categorias livremente, sem depender de nenhum preset fixo.
export function CostCategoryManager({ categories, onCreate, onRename, onSetActive }: CostCategoryManagerProps) {
  const [newName, setNewName] = useState('')
  const [newKind, setNewKind] = useState<CostKind>('variable')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  const visibleCategories = categories.filter((category) => showInactive || category.isActive)

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!newName.trim()) return
    setIsSubmitting(true)
    try {
      await onCreate({ name: newName.trim(), kind: newKind })
      setNewName('')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEditing(category: CostCategory) {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  async function saveEditing(id: string) {
    if (editingName.trim()) {
      await onRename(id, editingName.trim())
    }
    setEditingId(null)
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-900">Categorias de custo</p>
        <button
          type="button"
          onClick={() => setShowInactive((current) => !current)}
          className="text-xs text-slate-500 underline"
        >
          {showInactive ? 'Ocultar desativadas' : 'Mostrar desativadas'}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          Custo fixo
          <InfoTooltip conceptId="custo_fixo" />
        </span>
        <span className="inline-flex items-center gap-1">
          Custo variável
          <InfoTooltip conceptId="custo_variavel" />
        </span>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {visibleCategories.map((category) => (
          <li
            key={category.id}
            className={`flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 ${
              category.isActive ? '' : 'opacity-50'
            }`}
          >
            {editingId === category.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                onBlur={() => saveEditing(category.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveEditing(category.id)
                }}
                className={fieldClass}
              />
            ) : (
              <button type="button" onClick={() => startEditing(category)} className="text-left text-sm text-slate-900">
                {category.name}
                <span className="ml-2 text-xs text-slate-500">{COST_KIND_LABELS[category.kind]}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSetActive(category.id, !category.isActive)}
              className="shrink-0 text-xs text-slate-500 underline"
            >
              {category.isActive ? 'Desativar' : 'Reativar'}
            </button>
          </li>
        ))}
        {visibleCategories.length === 0 && <p className="text-sm text-slate-500">Nenhuma categoria ainda.</p>}
      </ul>

      <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nova categoria (ex: Aluguel)"
          className={fieldClass}
        />
        <select value={newKind} onChange={(event) => setNewKind(event.target.value as CostKind)} className={fieldClass}>
          {(Object.keys(COST_KIND_LABELS) as CostKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {COST_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
        <PrimaryButton type="submit" variant="secondary" disabled={isSubmitting || !newName.trim()}>
          Adicionar
        </PrimaryButton>
      </form>
    </Card>
  )
}
