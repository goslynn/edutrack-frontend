import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function DashboardPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem('accessToken')
      storage.removeItem('refreshToken')
    }
    navigate('/login')
  }

  const accessToken = localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">EduTrack</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-surface border border-border rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
          <p className="text-muted mb-4">¡Bienvenido a EduTrack!</p>

          <div className="mt-8 p-4 rounded-md bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted mb-2">Token de acceso guardado:</p>
            <code className="text-xs break-all text-accent">
              {accessToken?.substring(0, 50)}...
            </code>
          </div>
        </div>
      </main>
    </div>
  )
}
