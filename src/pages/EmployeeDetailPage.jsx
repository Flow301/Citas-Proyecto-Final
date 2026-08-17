import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  changeEmployeeStatus,
  getEmployeeById,
} from "@/services/employeeService"
import { useAuth } from "@/context/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

function formatPrice(price) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(price))
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "No disponible"
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(dateValue))
}

function formatTime(timeValue) {
  if (!timeValue) {
    return "No disponible"
  }

  if (String(timeValue).includes("T")) {
    return String(timeValue).slice(11, 16)
  }

  return String(timeValue).slice(0, 5)
}

async function requestEmployee(employeeId) {
  const response = await getEmployeeById(employeeId)
  return response.data
}

export function EmployeeDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdministrator =
    user.rol?.nombre === "Administrador"
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [changingStatus, setChangingStatus] = useState(false)
  const [statusError, setStatusError] = useState("")

  useEffect(() => {
    let isActive = true

    requestEmployee(id)
      .then((data) => {
        if (isActive) {
          setEmployee(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [id])

  const sortedAppointments = useMemo(() => {
    if (!employee?.citas) {
      return []
    }

    return [...employee.citas].sort((first, second) => {
      const firstValue =
        `${first.fecha}${first.horaInicio}`
      const secondValue =
        `${second.fecha}${second.horaInicio}`

      return firstValue.localeCompare(secondValue)
    })
  }, [employee])

  async function handleStatusChange() {
    const newStatus = !employee.activo

    setChangingStatus(true)
    setStatusError("")

    try {
      await changeEmployeeStatus(employee.id, newStatus)

      setEmployee((currentEmployee) => ({
        ...currentEmployee,
        activo: newStatus,
      }))
    } catch (requestError) {
      setStatusError(requestError.message)
    } finally {
      setChangingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />

        <Card className="mx-auto max-w-5xl">
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>

          <CardContent className="space-y-5">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <p role="alert" className="text-destructive">
            {error || "No se encontró el empleado."}
          </p>

          <Button
            nativeButton={false}
            variant="outline"
            render={<Link to="/empleados" />}
          >
            Volver a empleados
          </Button>
        </CardContent>
      </Card>
    )
  }

  const fullName = getFullName(employee.usuario)
  const services = employee.servicios || []
  const restrictions = employee.restricciones || []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link to="/empleados" />}
        >
          Volver a empleados
        </Button>

        {isAdministrator && (
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              variant="outline"
              render={
                <Link to={`/empleados/${employee.id}/editar`} />
              }
            >
              Editar empleado
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant={
                      employee.activo ? "destructive" : "default"
                    }
                    disabled={changingStatus}
                  />
                }
              >
                {changingStatus
                  ? "Actualizando..."
                  : employee.activo
                    ? "Desactivar empleado"
                    : "Activar empleado"}
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {employee.activo
                      ? "¿Desactivar este empleado?"
                      : "¿Activar este empleado?"}
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    {employee.activo
                      ? "El empleado dejará de estar disponible para recibir nuevas citas."
                      : "El empleado volverá a estar disponible para recibir nuevas citas."}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={changingStatus}>
                    Cancelar
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={handleStatusChange}
                    disabled={changingStatus}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {statusError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {statusError}
        </div>
      )}

      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {fullName}
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                {employee.codigoEmpleado}
              </p>
            </div>

            <ActiveStatusBadge active={employee.activo} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileItem
              label="Correo electrónico"
              value={employee.usuario?.correo}
            />

            <ProfileItem
              label="Teléfono"
              value={employee.usuario?.telefono}
            />

            <ProfileItem
              label="Especialidad"
              value={employee.especialidad?.nombre}
            />

            <ProfileItem
              label="Servicios asignados"
              value={String(services.length)}
            />

            <ProfileItem
              label="Citas asignadas"
              value={String(sortedAppointments.length)}
            />

            <ProfileItem
              label="Fecha de registro"
              value={formatDate(employee.creadoEn)}
            />
          </dl>

          <div>
            <p className="text-sm text-muted-foreground">
              Descripción
            </p>

            <p className="leading-7">
              {employee.descripcion || "Sin descripción registrada."}
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="mx-auto max-w-5xl space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Servicios asignados
          </h2>

          <p className="text-sm text-muted-foreground">
            Servicios que este empleado puede atender.
          </p>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay servicios asignados.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">
                      {service.nombre}
                    </p>

                    <ActiveStatusBadge
                      active={service.activo}
                    />
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">
                        Precio
                      </dt>

                      <dd className="font-medium">
                        {formatPrice(service.precioBase)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-muted-foreground">
                        Duración
                      </dt>

                      <dd className="font-medium">
                        {service.duracionMinutos} minutos
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Restricciones
          </h2>

          <p className="text-sm text-muted-foreground">
            Bloqueos de disponibilidad asociados al empleado.
          </p>
        </div>

        {restrictions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay restricciones registradas.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {restrictions.map((restriction) => (
              <Card key={restriction.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">
                      {restriction.motivo}
                    </p>

                    <ActiveStatusBadge
                      active={restriction.activo}
                    />
                  </div>

                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">
                        Fecha
                      </dt>

                      <dd className="font-medium">
                        {formatDate(restriction.fecha)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-muted-foreground">
                        Horario
                      </dt>

                      <dd className="font-medium">
                        {restriction.todoElDia
                          ? "Todo el día"
                          : `${formatTime(
                            restriction.horaInicio
                          )}–${formatTime(
                            restriction.horaFin
                          )}`}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Citas asignadas
          </h2>

          <p className="text-sm text-muted-foreground">
            Total registrado: {sortedAppointments.length}.
          </p>
        </div>

        {sortedAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay citas asignadas.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                  <ProfileItem
                    label="Cliente"
                    value={getFullName(appointment.cliente)}
                  />

                  <ProfileItem
                    label="Servicio"
                    value={appointment.servicio?.nombre}
                  />

                  <ProfileItem
                    label="Fecha y hora"
                    value={`${formatDate(
                      appointment.fecha
                    )}, ${formatTime(
                      appointment.horaInicio
                    )}–${formatTime(
                      appointment.horaFin
                    )}`}
                  />

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Estado
                    </p>

                    <Badge variant="secondary">
                      {appointment.estadoCita?.nombre ||
                        "No disponible"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ProfileItem({ label, value }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm text-muted-foreground">
        {label}
      </dt>

      <dd className="font-medium">
        {value || "No registrado"}
      </dd>
    </div>
  )
}