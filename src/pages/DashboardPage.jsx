import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DashboardPage() {
  const { user, logout } = useAuth()

  const fullName = [
    user.nombre,
    user.primerApellido,
    user.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <main className="min-h-screen bg-muted p-4 sm:p-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Bienvenido, {fullName}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Correo electrónico
            </p>
            <p>{user.correo}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Rol</p>
            <p>{user.rol?.nombre || "Sin rol asignado"}</p>
          </div>

          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}