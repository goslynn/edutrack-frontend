import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardLayoutPage } from '@/pages/dashboard/DashboardLayoutPage'
import { InicioPage } from '@/pages/dashboard/InicioPage'
import { AsistenciaPage } from '@/pages/dashboard/AsistenciaPage'
import { AnotacionesPage } from '@/pages/dashboard/AnotacionesPage'
import { EstudiantesPage } from '@/pages/dashboard/EstudiantesPage'
import { CalificacionesPage } from '@/pages/dashboard/calificaciones/CalificacionesPage'
import { CalificacionesIndexPage } from '@/pages/dashboard/calificaciones/CalificacionesIndexPage'
import { LibroNotasPage } from '@/pages/dashboard/calificaciones/LibroNotasPage'
import { ConfiguracionPage } from '@/pages/dashboard/configuracion/ConfiguracionPage'
import { ConfiguracionIndexPage } from '@/pages/dashboard/configuracion/ConfiguracionIndexPage'
import { ConfiguracionPanelPage } from '@/pages/dashboard/configuracion/ConfiguracionPanelPage'
import { PlaceholderPage } from '@/pages/dashboard/PlaceholderPage'
import { isAuthenticated } from '@/lib/session'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // La sesión vive en cookies (persistente o de sesión según "mantener sesión iniciada").
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayoutPage />
            </ProtectedRoute>
          }
        >
          {/* "Inicio" vive en /dashboard; cada sección en su propia ruta. */}
          <Route index element={<InicioPage />} />
          <Route path="calificaciones" element={<CalificacionesPage />}>
            {/* Índice = evaluaciones/promedios; el libro de notas cuelga como ruta propia. */}
            <Route index element={<CalificacionesIndexPage />} />
            <Route path=":evaluationId" element={<LibroNotasPage />} />
          </Route>
          <Route path="asistencia" element={<AsistenciaPage />} />
          <Route path="anotaciones" element={<AnotacionesPage />} />
          <Route path="contenidos" element={<PlaceholderPage />} />
          <Route path="estudiantes" element={<EstudiantesPage />} />
          <Route path="reportes" element={<PlaceholderPage />} />
          <Route path="notificaciones" element={<PlaceholderPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />}>
            {/* Índice = documento de secciones; cada panel en su propia ruta. */}
            <Route index element={<ConfiguracionIndexPage />} />
            <Route path=":panelId" element={<ConfiguracionPanelPage />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
