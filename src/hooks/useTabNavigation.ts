import { useEffect, useState } from 'react'

// Faz a troca de aba usar o histórico de verdade do navegador (History
// API), em vez de só um useState solto — assim a seta "voltar" do
// navegador troca de aba em vez de sair do app. Não muda a URL visível, só
// usa o histórico como uma pilha de "em qual aba eu estava".
export function useTabNavigation<Tab extends string>(initialTab: Tab) {
  const [activeTab, setActiveTab] = useState<Tab>(
    () => (window.history.state?.tab as Tab | undefined) ?? initialTab,
  )

  useEffect(() => {
    if (!window.history.state?.tab) {
      window.history.replaceState({ tab: activeTab }, '')
    }

    function handlePopState(event: PopStateEvent) {
      const tab = event.state?.tab as Tab | undefined
      if (tab) setActiveTab(tab)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function navigateToTab(tab: Tab) {
    if (tab === activeTab) return
    window.history.pushState({ tab }, '')
    setActiveTab(tab)
  }

  return [activeTab, navigateToTab] as const
}
