import { useMemo, useState } from 'react'
import { Card } from '../components/Card'
import { fieldClass } from '../components/Field'
import { CONCEPT_TIPS } from '../features/education/tips'

interface GlossaryPageProps {
  onBack: () => void
}

// Remove acento pra busca não depender de o usuário digitar "capital de
// giro" com acento certinho. ̀-ͯ é a faixa dos acentos que o
// normalize('NFD') separa da letra (ex: "á" vira "a" + acento).
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Lista todos os conceitos financeiros do app (mesmo conteúdo das dicas
// educativas em education/tips.ts, incluindo termos que não aparecem
// sozinhos em nenhuma tela) com busca — pra quem quiser reler ou descobrir
// uma explicação sem precisar esperar ela aparecer sozinha. Cada termo
// começa fechado, mostrando só o título, e expande ao tocar (ver pedido de
// "deixar só o título, com opção de colapsar" no PR).
export function GlossaryPage({ onBack }: GlossaryPageProps) {
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const terms = useMemo(() => {
    const all = Object.values(CONCEPT_TIPS).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
    const query = normalize(search.trim())
    if (!query) return all
    return all.filter((tip) => normalize(tip.title).includes(query) || normalize(tip.body).includes(query))
  }, [search])

  function toggle(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-24">
      <button type="button" onClick={onBack} className="self-start text-sm text-slate-600 underline">
        ← Voltar
      </button>

      <div>
        <h1 className="text-lg font-bold text-slate-900">📖 Glossário de termos</h1>
        <p className="mt-1 text-sm text-slate-500">Toque num termo pra ver a explicação.</p>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar um termo (ex: margem)"
        className={fieldClass}
      />

      {terms.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum termo encontrado pra "{search}".</p>
      ) : (
        <div className="flex flex-col gap-2">
          {terms.map((tip) => {
            const isExpanded = expandedIds.has(tip.id)
            return (
              <Card key={tip.id} className="p-0">
                <button
                  type="button"
                  onClick={() => toggle(tip.id)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span className="font-semibold text-slate-900">{tip.title}</span>
                  <span className="shrink-0 text-lg leading-none text-slate-400">{isExpanded ? '−' : '+'}</span>
                </button>
                {isExpanded && <p className="px-4 pb-4 text-sm text-slate-600">{tip.body}</p>}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
