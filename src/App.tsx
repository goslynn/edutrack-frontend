import { env } from '@/env'

function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
      <div className="max-w-xl w-full text-center px-8 py-12 rounded-2xl bg-surface border border-border shadow-lg">
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          Hola, <span className="text-primary">EduTrack</span>
        </h1>
        <p className="text-muted text-lg">
          Tailwind v4 conectado vía <code className="px-2 py-1 rounded bg-secondary text-secondary-foreground">globals.css</code>
        </p>

        <p className="mt-6 text-sm text-muted">
          API base URL: <code className="text-accent">{env.apiBaseUrl}</code>
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
          <span className="px-3 py-2 rounded-md bg-primary text-primary-foreground">primary</span>
          <span className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground">secondary</span>
          <span className="px-3 py-2 rounded-md bg-accent text-accent-foreground">accent</span>
          <span className="px-3 py-2 rounded-md bg-success text-success-foreground">success</span>
          <span className="px-3 py-2 rounded-md bg-warning text-warning-foreground">warning</span>
          <span className="px-3 py-2 rounded-md bg-danger text-danger-foreground">danger</span>
        </div>
      </div>
    </main>
  )
}

export default App
