import { env } from '@/env'

function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
      <div className="text-center px-8 py-12 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Hola, <span className="text-indigo-400">EduTrack</span>
        </h1>
        <p className="text-slate-300 text-lg">
          Tailwind v4 conectado vía <code className="px-2 py-1 rounded bg-slate-800 text-indigo-300">globals.css</code>
        </p>
        <p className="mt-6 text-xs text-slate-400">
          API base URL: <code className="text-emerald-300">{env.apiBaseUrl}</code>
        </p>
      </div>
    </main>
  )
}

export default App
