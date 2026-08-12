import { useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { InfoTooltip } from '../education/InfoTooltip'
import { COST_KIND_CONCEPT_IDS, COST_KIND_LABELS } from './types'
import type { CostCategory, CostKind } from './types'

interface CostKindPickerProps {
  value: CostKind
  onChange: (kind: CostKind) => void
}

// Botões lado a lado pra escolher "Custo fixo" ou "Custo variável", cada um
// com um ícone "i" ao lado explicando o conceito — reaproveitado tanto na
// criação quanto na edição de uma categoria.
function CostKindPicker({ value, onChange }: CostKindPickerProps) {
  return (
    <div className="flex gap-2">
      {(Object.keys(COST_KIND_LABELS) as CostKind[]).map((kind) => (
        <div
          key={kind}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm ${
            value === kind ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-300 text-slate-700'
          }`}
        >
          <button type="button" onClick={() => onChange(kind)} className="flex-1 text-center">
            {COST_KIND_LABELS[kind]}
          </button>
          <InfoTooltip conceptId={COST_KIND_CONCEPT_IDS[kind]} />
        </div>
      ))}
    </div>
  )
}

interface CostCategoryManagerProps {
  categories: CostCategory[]
  // Ids de categoria que já têm pelo menos um lançamento — usado só pra
  // decidir o aviso ao excluir (ver handleDelete).
  usedCategoryIds: Set<string>
  onCreate: (input: { name: string; kind: CostKind }) => Promise<unknown>
  onUpdate: (id: string, input: { name: string; kind: CostKind }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

// Gerenciador de categorias de custo: a ficha inicial só sugere um ponto de
// partida (ver businessTypePresets.ts) — aqui o usuário cria, edita e
// exclui categorias livremente, sem depender de nenhum preset fixo.
export function CostCategoryManager({ categories, usedCategoryIds, onCreate, onUpdate, onDelete }: CostCategoryManagerProps) {
  const [newName, setNewName] = useState('')
  const [newKind, setNewKind] = useState<CostKind>('variable')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingKind, setEditingKind] = useState<CostKind>('variable')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Categoria aguardando confirmação de exclusão (só quando já tem
  // lançamento). Usamos um aviso na própria tela em vez de window.confirm()
  // porque esse app é instalado como PWA (ver public/manifest.webmanifest,
  // "display": "standalone") — nesse modo, o iOS ignora silenciosamente
  // confirm()/alert() nativos, então o aviso nunca apareceria.
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!newName.trim()) return
    setIsSubmitting(true)
    setError('')
    try {
      await onCreate({ name: newName.trim(), kind: newKind })
      setNewName('')
    } catch (createError) {
      console.error('Erro ao criar categoria:', createError)
      setError('Não foi possível criar essa categoria agora. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEditing(category: CostCategory) {
    setEditingId(category.id)
    setEditingName(category.name)
    setEditingKind(category.kind)
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
  }

  async function saveEditing(id: string) {
    if (!editingName.trim()) return
    setError('')
    try {
      await onUpdate(id, { name: editingName.trim(), kind: editingKind })
      setEditingId(null)
    } catch (updateError) {
      console.error('Erro ao editar categoria:', updateError)
      setError('Não foi possível salvar essa edição agora. Tente novamente.')
    }
  }

  function handleDeleteClick(category: CostCategory) {
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
      <p className="font-semibold text-slate-900">Categorias de custo</p>
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
                <CostKindPicker value={editingKind} onChange={setEditingKind} />
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
                  Excluir "{category.name}"? Ela já tem lançamento de custo. Esses lançamentos não serão apagados, mas vão
                  ficar sem categoria até você editá-los e escolher outra.
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
                <span className="ml-2 text-xs text-slate-500">{COST_KIND_LABELS[category.kind]}</span>
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
        {categories.length === 0 && <p className="text-sm text-slate-500">Nenhuma categoria ainda.</p>}
      </ul>

      <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Nova categoria (ex: Aluguel)"
          className={fieldClass}
        />

        <div className="flex flex-col gap-1">
          <span className={labelClass}>Tipo de custo</span>
          <CostKindPicker value={newKind} onChange={setNewKind} />
        </div>

        <PrimaryButton type="submit" variant="secondary" disabled={isSubmitting || !newName.trim()}>
          Adicionar
        </PrimaryButton>
      </form>
    </Card>
  )
}
