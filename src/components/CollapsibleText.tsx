import { useEffect, useRef, useState } from 'react'

interface CollapsibleTextProps {
  text: string
  className?: string
}

// Trunca pra 2 linhas quando o texto realmente ocupa mais que isso, com um
// botão pra expandir e recolher — usado nas observações do histórico de
// custos e receitas, que são texto livre e podem ficar grandes.
//
// Em vez de adivinhar "é grande" por quantidade de caracteres (a largura
// disponível varia — o card de custo tem menos espaço que o de receita, por
// exemplo, já que divide a linha com o valor), medimos o estouro de verdade
// depois de renderizado: comparamos a altura real do conteúdo
// (scrollHeight) com a altura visível limitada pelo line-clamp
// (clientHeight). Só mostramos o botão quando o texto realmente não coube.
export function CollapsibleText({ text, className = '' }: CollapsibleTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const element = textRef.current
    if (!element) return
    setIsOverflowing(element.scrollHeight > element.clientHeight)
  }, [text])

  return (
    <div>
      <p ref={textRef} className={`${className} ${isExpanded ? '' : 'line-clamp-2'}`}>
        {text}
      </p>
      {isOverflowing && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="text-xs font-medium text-emerald-700 underline"
        >
          {isExpanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}
