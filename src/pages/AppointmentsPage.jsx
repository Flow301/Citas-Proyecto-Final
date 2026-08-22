import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import {
  getAppointments,
  getClientAppointments,
  getEmployeeAppointments,
} from "@/services/appointmentService"

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

function formatPrice(price) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(price))
}

function getFullName(user) {
  if (!user) {
    return "No disponible"
  }

  return [
    user.nombre,
    user.primerApellido,
    user.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
}

function getStatusClass(statusName) {
  const classes = {
    Pendiente:
      "border-yellow-200 bg-yellow-100 text-yellow-800",
    Confirmada:
      "border-blue-200 bg-blue-100 text-blue-800",
    Finalizada:
      "border-green-200 bg-green-100 text-green-800",
    Cancelada:
      "border-red-200 bg-red-100 text-red-800",
  }

  return (
    classes[statusName] ??
    "border-muted bg-muted text-muted-foreground"
  )
}

async function requestAppointments(user) {
  const role = user.rol?.nombre

  if (role === "Administrador") {
    return getAppointments()
  }

  if (role === "Empleado") {
    if (!user.empleado?.id) {
      throw new Error(
        "El usuario no tiene un empleado asociado."
      )
    }

    return getEmployeeAppointments(user.empleado.id)
  }

  if (role === "Cliente") {
    return getClientAppointments(user.id)
  }

  throw new Error("El usuario no posee un rol válido.")
}

function getPageInformation(role) {
  if (role === "Administrador") {
    return {
      title: "Citas",
      description:
        "Consulta y administra todas las citas registradas.",
    }
  }

  if (role === "Empleado") {
    return {
      title: "Citas asignadas",
      description:
        "Consulta las citas que tienes asignadas.",
    }
  }

  return {
    title: "Mis citas",
    description:
      "Consulta y da seguimiento a tus citas.",
  }
}

export function AppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [sorting, setSorting] = useState("fecha-desc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const role = user.rol?.nombre
  const pageInformation = getPageInformation(role)
  const canCreateAppointment =
    role === "Administrador" || role === "Empleado"

  useEffect(() => {
    let isActive = true

    requestAppointments(user)
      .then((response) => {
        if (isActive) {
          setAppointments(response.data ?? [])
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
  }, [user])

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((first, second) => {
      if (sorting === "fecha-asc") {
        return `${first.fecha}${first.horaInicio}`.localeCompare(
          `${second.fecha}${second.horaInicio}`
        )
      }

      if (sorting === "estado-asc") {
        return (
          first.estadoCita?.nombre ?? ""
        ).localeCompare(
          second.estadoCita?.nombre ?? "",
          "es"
        )
      }

      return `${second.fecha}${second.horaInicio}`.localeCompare(
        `${first.fecha}${first.horaInicio}`
      )
    })
  }, [appointments, sorting])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {pageInformation.title}
          </h1>

          <p className="text-muted-foreground">
            {pageInformation.description}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {canCreateAppointment && (
            <Button
              nativeButton={false}
              render={<Link to="/citas/nueva" />}
            >
              Nueva cita
            </Button>
          )}

          <div className="space-y-2">
            <label
              htmlFor="appointment-sorting"
              className="block text-sm font-medium"
            >
              Ordenar por
            </label>

            <select
              id="appointment-sorting"
              value={sorting}
              onChange={(event) =>
                setSorting(event.target.value)
              }
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="fecha-desc">
                Fecha: más reciente
              </option>

              <option value="fecha-asc">
                Fecha: más próxima
              </option>

              <option value="estado-asc">
                Estado: A-Z
              </option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Cargando citas...
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-8 text-center">
            <p role="alert" className="text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {!loading &&
        !error &&
        sortedAppointments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="font-medium">
                No hay citas registradas.
              </p>

              <p className="text-muted-foreground">
                Las citas aparecerán aquí cuando sean
                registradas.
              </p>
            </CardContent>
          </Card>
        )}

      {!loading &&
        !error &&
        sortedAppointments.length > 0 && (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        {appointment.servicio?.nombre ??
                          "Servicio no disponible"}
                      </CardTitle>

                      <p className="text-sm text-muted-foreground">
                        {formatDate(appointment.fecha)}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={getStatusClass(
                        appointment.estadoCita?.nombre
                      )}
                    >
                      {appointment.estadoCita?.nombre ??
                        "Estado no disponible"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Horario
                      </dt>

                      <dd className="font-medium">
                        {formatTime(
                          appointment.horaInicio
                        )}{" "}
                        - {formatTime(appointment.horaFin)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Cliente
                      </dt>

                      <dd className="font-medium">
                        {getFullName(appointment.cliente)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Empleado
                      </dt>

                      <dd className="font-medium">
                        {getFullName(
                          appointment.empleado?.usuario
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Costo total
                      </dt>

                      <dd className="font-medium">
                        {formatPrice(
                          appointment.costoTotal
                        )}
                      </dd>
                    </div>
                  </dl>

                  <Button
                    nativeButton={false}
                    variant="outline"
                    render={
                      <Link
                        to={`/citas/${appointment.id}`}
                      />
                    }
                  >
                    Ver detalle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}