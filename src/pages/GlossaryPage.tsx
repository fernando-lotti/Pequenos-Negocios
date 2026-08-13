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
// educativas em education/tips.ts) com busca — pra quem quiser reler uma
// explicação sem precisar esperar ela aparecer sozinha de novo.
export function GlossaryPage({ onBack }: GlossaryPageProps) {
  const [search, setSearch] = useState('')

  const terms = useMemo(() => {
    const all = Object.values(CONCEPT_TIPS).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
    const query = normalize(search.trim())
    if (!query) return all
    return all.filter((tip) => normalize(tip.title).includes(query) || normalize(tip.body).includes(query))
  }, [search])

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-24">
      <button type="button" onClick={onBack} className="self-start text-sm text-slate-600 underline">
        ← Voltar
      </button>

      <div>
        <h1 className="text-lg font-bold text-slate-900">📖 Glossário de termos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Os principais conceitos financeiros usados no app, explicados em português simples.
        </p>
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
        <div className="flex flex-col gap-3">
          {terms.map((tip) => (
            <Card key={tip.id}>
              <p className="font-semibold text-slate-900">{tip.title}</p>
              <p className="mt-1 text-sm text-slate-600">{tip.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
