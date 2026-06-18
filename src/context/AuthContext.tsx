import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { isAuthenticated, getCurrentUserId } from '@/lib/session'
import { getUserById } from '@/api/auth'
import type { AuthUser } from '@/types/usuarios'

interface AuthContextValue {
  user: AuthUser | null
  /** `true` mientras se carga el perfil en el bootstrap inicial. */
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(isAuthenticated())

  useEffect(() => {
    if (!isAuthenticated()) {
      setIsLoading(false)
      return
    }
    const id = getCurrentUserId()
    if (!id) {
      setIsLoading(false)
      return
    }
    getUserById(id).then((result) => {
      if (result.ok) setUser(result.value)
      setIsLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
