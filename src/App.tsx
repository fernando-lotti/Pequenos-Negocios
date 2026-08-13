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
import type { Tab } from './pages/types'

function AuthenticatedApp({
  user,
  businesses,
  activeBusiness,
  setActiveBusinessId,
  createBusiness,
  updateMonthlyGoal,
}: AuthGateContext) {
  const [activeTab, navigateToTab] = useTabNavigation<Tab>('dashboard')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <span className="text-sm font-bold text-emerald-700">💼 Pequenos Negócios</span>
          <BusinessSwitcher
            businesses={businesses}
            activeBusiness={activeBusiness}
            onSelect={setActiveBusinessId}
            onCreate={async (input) => void (await createBusiness(input))}
          />
        </div>
      </header>

      {activeTab === 'dashboard' && (
        <DashboardPage business={activeBusiness} onManageGoal={() => navigateToTab('settings')} />
      )}
      {activeTab === 'costs' && (
        <CostsPage business={activeBusiness} onManageCategories={() => navigateToTab('settings')} />
      )}
      {activeTab === 'revenue' && (
        <RevenuePage business={activeBusiness} onManageCategories={() => navigateToTab('settings')} />
      )}
      {activeTab === 'reports' && <ReportsPage business={activeBusiness} />}
      {activeTab === 'settings' && (
        <SettingsPage business={activeBusiness} userEmail={user.email ?? ''} onSaveMonthlyGoal={updateMonthlyGoal} />
      )}

      <BottomNav activeTab={activeTab} onNavigate={navigateToTab} />
    </div>
  )
}

function App() {
  return <AuthGate>{(context) => <AuthenticatedApp {...context} />}</AuthGate>
}

export default App
