import { Navigate } from "react-router"
import { useAuth } from "@/context/auth-context"

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted">
        <p className="text-sm text-muted-foreground">
          Verificando sesión...
        </p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}