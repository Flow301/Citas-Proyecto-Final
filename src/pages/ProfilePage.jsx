import { useAuth } from "@/context/auth-context"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function formatDate(dateValue) {
  if (!dateValue) {
    return "No disponible"
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
  }).format(new Date(dateValue))
}

function ProfileItem({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "No registrado"}</p>
    </div>
  )
}

export function ProfilePage() {
  const { user } = useAuth()

  const fullName = [
    user.nombre,
    user.primerApellido,
    user.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-muted-foreground">
          Consulta la información asociada con tu cuenta.
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>{fullName}</CardTitle>
              <CardDescription>{user.correo}</CardDescription>
            </div>

            <Badge variant={user.activo ? "default" : "destructive"}>
              {user.activo ? "Usuario activo" : "Usuario inactivo"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 sm:grid-cols-2">
          <ProfileItem label="Nombre completo" value={fullName} />

          <ProfileItem
            label="Correo electrónico"
            value={user.correo}
          />

          <ProfileItem
            label="Teléfono"
            value={user.telefono}
          />

          <ProfileItem
            label="Rol en el sistema"
            value={user.rol?.nombre}
          />

          <ProfileItem
            label="Descripción del rol"
            value={user.rol?.descripcion}
          />

          <ProfileItem
            label="Fecha de registro"
            value={formatDate(user.creadoEn)}
          />
        </CardContent>
      </Card>
    </div>
  )
}