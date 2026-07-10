import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from './store/authStore'
import Nav from './components/Nav'
import DateNavBar from './components/DateNavBar'
import { InstallPrompt } from './components/InstallPrompt'
import { UpdateToast } from './components/UpdateToast'
import { AiChatModal } from './components/AiChatModal'
import { useChatStore } from './store/chatStore'
import { addFoodsToDiary } from './hooks/useDiary'
import { useDateStore } from './store/dateStore'
import LoginPage from './pages/LoginPage'
import SetPasswordPage from './pages/SetPasswordPage'
import AdminPage from './pages/AdminPage'

// Páginas carregadas sob demanda (code splitting por rota)
const HomePage   = lazy(() => import('./pages/HomePage'))
const DiarioPage = lazy(() => import('./pages/DiarioPage'))
const TreinoPage = lazy(() => import('./pages/TreinoPage'))
const CorpoPage  = lazy(() => import('./pages/CorpoPage'))
const MaisPage   = lazy(() => import('./pages/MaisPage'))
const VisualMockPage = lazy(() => import('./pages/VisualMockPage'))

function Spinner() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
        style={{ borderTopColor: 'var(--ember)' }}
      />
    </div>
  )
}

// Guard: so acessa se estiver logado
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}


// Guard: so acessa se for o admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuthStore()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/home" replace />
  return <>{children}</>
}

// Guard: redireciona para /home se ja estiver logado
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <Spinner />
  if (user) return <Navigate to="/home" replace />
  return <>{children}</>
}

// Layout com Nav inferior — usado em todas as rotas privadas com abas
function AppLayout() {
  const { user } = useAuthStore()
  const { open, initialShowPhoto, initialInput, openChat, closeChat } = useChatStore()
  const { selectedDate } = useDateStore()

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: 'var(--bg)' }}>
      <DateNavBar />
      {/* Conteúdo da página — padding-bottom para não ficar atrás do Nav + safe area iOS */}
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Nav />

      <button
        onClick={() => openChat()}
        aria-label="Kcal Coach IA"
        className="coach-fab"
      >
        🤖
      </button>

      {/* Única instância do AiChatModal — fora do <main> para z-index correto */}
      <AiChatModal
        open={open}
        onClose={closeChat}
        initialShowPhoto={initialShowPhoto}
        initialInput={initialInput}
        onAddFoods={user ? (meal, entries) => addFoodsToDiary(user.id, selectedDate, meal, entries) : undefined}
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <UpdateToast />
      <InstallPrompt />
      <Routes>
        {/* Rotas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Acessivel sem login — vem do link do email de convite/reset */}
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* Laboratorio visual isolado — mock clicavel, sem dados reais */}
        <Route
          path="/visual-mock"
          element={
            <Suspense fallback={<Spinner />}>
              <VisualMockPage />
            </Suspense>
          }
        />

        {/* Admin — so o email definido em VITE_ADMIN_EMAIL */}
        <Route
          path="/kcx-studio"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* Rotas privadas com Nav inferior */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/home"   element={<HomePage />} />
          <Route path="/diario" element={<DiarioPage />} />
          <Route path="/treino" element={<TreinoPage />} />
          <Route path="/corpo"  element={<CorpoPage />} />
          <Route path="/mais"   element={<MaisPage />} />
        </Route>

        {/* Qualquer rota desconhecida vai para /home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
        <Route path="/"  element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
