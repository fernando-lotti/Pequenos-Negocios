import { AuthGate } from './features/auth/AuthGate'
import type { AuthGateContext } from './features/auth/AuthGate'
import { BusinessSwitcher } from './features/business/BusinessSwitcher'
import { BottomNav } from './components/BottomNav'
import { useTabNavigation } from './hooks/useTabNavigation'
import { DashboardPage } from './pages/DashboardPage'
import { CostsPage } from './pages/CostsPage'
import { RevenuePage } from './pages/RevenuePage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { GlossaryPage } from './pages/GlossaryPage'
import type { Tab } from './pages/types'

function AuthenticatedApp({
  user,
  businesses,
  activeBusiness,
  setActiveBusinessId,
  createBusiness,
  updateMonthlyGoal,
}: AuthGateContext) {
  const [activeTab, navigateToTab, goBack] = useTabNavigation<Tab>('dashboard')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="print:hidden">
        <div className="bg-emerald-700 px-4 pb-7 pt-4">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <img
              src="/icon-192.png"
              alt="Logo Pequenos Negócios"
              className="h-11 w-11 shrink-0 rounded-xl shadow-sm"
            />
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Pequenos Negócios</h1>
          </div>
        </div>
        <div className="mx-auto -mt-4 max-w-md px-4">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-md">
            <BusinessSwitcher
              businesses={businesses}
              activeBusiness={activeBusiness}
              onSelect={setActiveBusinessId}
              onCreate={async (input) => void (await createBusiness(input))}
            />
          </div>
        </div>
      </header>

      {activeTab === 'dashboard' && (
        <DashboardPage
          business={activeBusiness}
          onManageGoal={() => navigateToTab('settings')}
          onOpenGlossary={() => navigateToTab('glossary')}
        />
      )}
      {activeTab === 'costs' && (
        <CostsPage business={activeBusiness} onManageCategories={() => navigateToTab('settings')} />
      )}
      {activeTab === 'revenue' && (
        <RevenuePage business={activeBusiness} onManageCategories={() => navigateToTab('settings')} />
      )}
      {activeTab === 'reports' && <ReportsPage business={activeBusiness} />}
      {activeTab === 'settings' && (
        <SettingsPage
          business={activeBusiness}
          userEmail={user.email ?? ''}
          onSaveMonthlyGoal={updateMonthlyGoal}
          onOpenGlossary={() => navigateToTab('glossary')}
        />
      )}
      {activeTab === 'glossary' && <GlossaryPage onBack={goBack} />}

      <BottomNav activeTab={activeTab} onNavigate={navigateToTab} />
    </div>
  )
}

function App() {
  return <AuthGate>{(context) => <AuthenticatedApp {...context} />}</AuthGate>
}

export default App
