import { useAuth } from "@/context/auth-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const roleDescriptions = {
  Administrador:
    "Desde aquí podrás administrar servicios, empleados, citas y consultar la agenda completa.",
  Empleado:
    "Desde aquí podrás consultar tus citas, agenda y servicios asignados.",
  Cliente:
    "Desde aquí podrás consultar tus citas y cancelar las que se encuentren pendientes.",
}

export function DashboardPage() {
  const { user } = useAuth()

  const firstName = user.nombre || "Usuario"
  const roleName = user.rol?.nombre

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido, {firstName}
        </h1>

        <p className="text-muted-foreground">
          Panel principal del Centro de Tutorías Académicas.
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Resumen de tu cuenta</CardTitle>
          <CardDescription>
            Has iniciado sesión como {roleName || "usuario"}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-6">
            {roleDescriptions[roleName] ||
              "Consulta las opciones disponibles en la navegación principal."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}