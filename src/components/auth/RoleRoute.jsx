import { Navigate } from "react-router"
import { useAuth } from "@/context/auth-context"

export function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth()
  const roleName = user?.rol?.nombre

  if (!allowedRoles.includes(roleName)) {
    return <Navigate to="/" replace />
  }

  return children
}