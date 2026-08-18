import { useEffect, useMemo, useState } from "react"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getSchedules,
  getWeekDays,
} from "@/services/scheduleService"

function formatTime(timeValue) {
  if (!timeValue) {
    return "No disponible"
  }

  if (String(timeValue).includes("T")) {
    return String(timeValue).slice(11, 16)
  }

  return String(timeValue).slice(0, 5)
}

export function SchedulesPage() {
  const [weekDays, setWeekDays] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isActive = true

    Promise.all([getWeekDays(), getSchedules()])
      .then(([daysResponse, schedulesResponse]) => {
        if (isActive) {
          setWeekDays(daysResponse.data ?? [])
          setSchedules(schedulesResponse.data ?? [])
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

  const orderedDays = useMemo(() => {
    return [...weekDays].sort(
      (first, second) =>
        first.numeroOrden - second.numeroOrden
    )
  }, [weekDays])

  function getDaySchedules(day) {
    const schedulesFromList = schedules.filter(
      (schedule) => schedule.diaSemanaId === day.id
    )

    if (schedulesFromList.length > 0) {
      return schedulesFromList
    }

    return day.horarios ?? []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Horarios de atención
        </h1>

        <p className="text-muted-foreground">
          Consulta el horario general del establecimiento para
          cada día de la semana.
        </p>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Cargando horarios...
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

      {!loading && !error && orderedDays.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">
              No hay horarios registrados.
            </p>

            <p className="text-muted-foreground">
              El establecimiento todavía no tiene un horario
              configurado.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && orderedDays.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {orderedDays.map((day) => {
            const daySchedules = getDaySchedules(day)

            return (
              <Card key={day.id}>
                <CardHeader>
                  <CardTitle>{day.nombre}</CardTitle>
                </CardHeader>

                <CardContent>
                  {daySchedules.length === 0 ? (
                    <p className="text-muted-foreground">
                      Cerrado
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                        >
                          <p className="font-medium">
                            {formatTime(schedule.horaInicio)} -{" "}
                            {formatTime(schedule.horaFin)}
                          </p>

                          <ActiveStatusBadge
                            active={schedule.activo}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}