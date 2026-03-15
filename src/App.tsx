import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Nav from './components/Nav'
import DateNavBar from './components/DateNavBar'
import { InstallPrompt } from './components/InstallPrompt'
import LoginPage from './pages/LoginPage'
import SetPasswordPage from './pages/SetPasswordPage'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import DiarioPage from './pages/DiarioPage'
import TreinoPage from './pages/TreinoPage'
import CorpoPage from './pages/CorpoPage'
import MaisPage from './pages/MaisPage'

function Spinner() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
        style={{ borderTopColor: 'var(--accent)' }}
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
  return (
    <div className="flex min-h-dvh flex-col" style={{ background: 'var(--bg)' }}>
      <DateNavBar />
      {/* Conteúdo da página — padding-bottom para não ficar atrás do Nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <Nav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
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
