import { Navigate } from "react-router"
import { useAuth } from "@/context/auth-context"

export function RoleRoute({ allowedRoles, children }) {
  const {
    user,
    isAuthenticated,
    loading,
  } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Verificando permisos...
        </p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const roleName = user?.rol?.nombre

  if (!allowedRoles.includes(roleName)) {
    return <Navigate to="/" replace />
  }

  return children
}