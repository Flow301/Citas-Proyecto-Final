import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRestrictions } from "@/services/restrictionService"

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
    return null
  }

  if (String(timeValue).includes("T")) {
    return String(timeValue).slice(11, 16)
  }

  return String(timeValue).slice(0, 5)
}

function getEmployeeName(restriction) {
  const user = restriction.empleado?.usuario

  if (!user) {
    return "Todo el establecimiento"
  }

  return [
    user.nombre,
    user.primerApellido,
    user.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
}

function getRestrictionSchedule(restriction) {
  if (restriction.todoElDia) {
    return "Todo el día"
  }

  const startTime = formatTime(restriction.horaInicio)
  const endTime = formatTime(restriction.horaFin)

  if (!startTime || !endTime) {
    return "Horario no disponible"
  }

  return `${startTime} - ${endTime}`
}

export function RestrictionsPage() {
  const [restrictions, setRestrictions] = useState([])
  const [sorting, setSorting] = useState("fecha-asc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isActive = true

    getRestrictions()
      .then((response) => {
        if (isActive) {
          setRestrictions(response.data ?? [])
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
  }, [])

  const sortedRestrictions = useMemo(() => {
    return [...restrictions].sort((first, second) => {
      if (sorting === "fecha-desc") {
        return second.fecha.localeCompare(first.fecha)
      }

      if (sorting === "empleado-asc") {
        return getEmployeeName(first).localeCompare(
          getEmployeeName(second),
          "es"
        )
      }

      return first.fecha.localeCompare(second.fecha)
    })
  }, [restrictions, sorting])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Restricciones de horario
          </h1>

          <p className="text-muted-foreground">
            Consulta los bloqueos de disponibilidad del
            establecimiento y de sus empleados.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="restriction-sorting"
            className="block text-sm font-medium"
          >
            Ordenar por
          </label>

          <select
            id="restriction-sorting"
            value={sorting}
            onChange={(event) =>
              setSorting(event.target.value)
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="fecha-asc">
              Fecha: más próxima
            </option>

            <option value="fecha-desc">
              Fecha: más lejana
            </option>

            <option value="empleado-asc">
              Empleado: A-Z
            </option>
          </select>
        </div>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Cargando restricciones...
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
        sortedRestrictions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="font-medium">
                No hay restricciones registradas.
              </p>

              <p className="text-muted-foreground">
                Las restricciones aparecerán aquí cuando sean
                registradas.
              </p>
            </CardContent>
          </Card>
        )}

      {!loading &&
        !error &&
        sortedRestrictions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedRestrictions.map((restriction) => (
              <Card key={restriction.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        {restriction.tipoRestriccion?.nombre ??
                          "Restricción de horario"}
                      </CardTitle>

                      <p className="text-sm text-muted-foreground">
                        {getEmployeeName(restriction)}
                      </p>
                    </div>

                    <ActiveStatusBadge
                      active={restriction.activo}
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Fecha
                      </dt>

                      <dd className="font-medium">
                        {formatDate(restriction.fecha)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Horario
                      </dt>

                      <dd className="font-medium">
                        {getRestrictionSchedule(restriction)}
                      </dd>
                    </div>
                  </dl>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Motivo
                    </p>

                    <p>
                      {restriction.motivo ||
                        "Sin motivo especificado"}
                    </p>
                  </div>

                  <Button
                    nativeButton={false}
                    variant="outline"
                    render={
                      <Link
                        to={`/restricciones/${restriction.id}`}
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