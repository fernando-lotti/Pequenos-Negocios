import { BarChart3, Home, Receipt, Settings, Wallet } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Tab } from '../pages/types'

interface BottomNavProps {
  activeTab: Tab
  onNavigate: (tab: Tab) => void
}

const TABS: { tab: Tab; label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { tab: 'dashboard', label: 'Início', Icon: Home },
  { tab: 'costs', label: 'Custos', Icon: Receipt },
  { tab: 'revenue', label: 'Receitas', Icon: Wallet },
  { tab: 'reports', label: 'Relatórios', Icon: BarChart3 },
  { tab: 'settings', label: 'Ajustes', Icon: Settings },
]

export function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white px-2 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 print:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {TABS.map(({ tab, label, Icon }) => {
          const isActive = tab === activeTab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onNavigate(tab)}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] ${
                isActive ? 'font-bold text-emerald-700' : 'font-medium text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={2} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
