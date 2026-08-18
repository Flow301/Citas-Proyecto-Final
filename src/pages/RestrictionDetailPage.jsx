import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getRestrictionById,
  getRestrictionTypes,
} from "@/services/restrictionService"

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

function getSchedule(restriction) {
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

export function RestrictionDetailPage() {
  const { id } = useParams()
  const [restriction, setRestriction] = useState(null)
  const [restrictionType, setRestrictionType] =
    useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isActive = true

    Promise.all([
      getRestrictionById(id),
      getRestrictionTypes(),
    ])
      .then(([restrictionResponse, typesResponse]) => {
        if (!isActive) {
          return
        }

        const restrictionData = restrictionResponse.data
        const types = typesResponse.data ?? []

        setRestriction(restrictionData)

        setRestrictionType(
          types.find(
            (type) =>
              type.id ===
              restrictionData.tipoRestriccionId
          ) ?? null
        )
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

  if (loading) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>

        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !restriction) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <p role="alert" className="text-destructive">
            {error || "No se encontró la restricción."}
          </p>

          <Button
            nativeButton={false}
            variant="outline"
            render={<Link to="/restricciones" />}
          >
            Volver a restricciones
          </Button>
        </CardContent>
      </Card>
    )
  }

  const typeName =
    restriction.tipoRestriccion?.nombre ??
    restrictionType?.nombre ??
    "Restricción de horario"

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="outline"
        render={<Link to="/restricciones" />}
      >
        Volver a restricciones
      </Button>

      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {typeName}
              </CardTitle>

              <p className="text-muted-foreground">
                {getEmployeeName(restriction)}
              </p>
            </div>

            <ActiveStatusBadge
              active={restriction.activo}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">
                Alcance
              </dt>

              <dd className="font-semibold">
                {restriction.empleadoId
                  ? "Empleado específico"
                  : "Todo el establecimiento"}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Empleado
              </dt>

              <dd className="font-semibold">
                {getEmployeeName(restriction)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Fecha
              </dt>

              <dd className="font-semibold">
                {formatDate(restriction.fecha)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Horario bloqueado
              </dt>

              <dd className="font-semibold">
                {getSchedule(restriction)}
              </dd>
            </div>
          </dl>

          <div>
            <p className="text-sm text-muted-foreground">
              Motivo
            </p>

            <p className="leading-7">
              {restriction.motivo ||
                "Sin motivo especificado"}
            </p>
          </div>

          {restrictionType?.descripcion && (
            <div>
              <p className="text-sm text-muted-foreground">
                Descripción del tipo
              </p>

              <p className="leading-7">
                {restrictionType.descripcion}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}