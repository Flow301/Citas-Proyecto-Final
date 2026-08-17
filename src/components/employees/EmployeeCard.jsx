import { Link } from "react-router"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function getFullName(user) {
  if (!user) {
    return "Usuario no disponible"
  }

  return [
    user.nombre,
    user.primerApellido,
    user.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
}

export function EmployeeCard({
  employee,
  specialtyName,
}) {
  const fullName = getFullName(employee.usuario)
  const serviceCount = employee.servicios?.length || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {fullName}
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              {employee.codigoEmpleado}
            </p>
          </div>

          <ActiveStatusBadge active={employee.activo} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">
              Especialidad
            </dt>

            <dd className="font-medium">
              {specialtyName || "No disponible"}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground">
              Correo electrónico
            </dt>

            <dd className="break-all font-medium">
              {employee.usuario?.correo || "No disponible"}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground">
              Servicios asignados
            </dt>

            <dd className="font-medium">
              {serviceCount}
            </dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter>
        <Button
          nativeButton={false}
          className="w-full"
          variant="outline"
          render={<Link to={`/empleados/${employee.id}`} />}
        >
          Ver detalle
        </Button>
      </CardFooter>
    </Card>
  )
}