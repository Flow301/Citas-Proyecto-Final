import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import { Button } from "@/components/ui/button"
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
import { useAuth } from "@/context/auth-context"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  changeScheduleStatus,
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
    const [changingScheduleId, setChangingScheduleId] =
    useState(null)
  const [statusError, setStatusError] = useState("")
  const { user } = useAuth()
  const isAdministrator =
    user.rol?.nombre === "Administrador"

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
  
    async function handleStatusChange(schedule) {
    const newStatus = !schedule.activo

    setChangingScheduleId(schedule.id)
    setStatusError("")

    try {
      await changeScheduleStatus(
        schedule.id,
        newStatus
      )

      setSchedules((currentSchedules) =>
        currentSchedules.map((currentSchedule) =>
          currentSchedule.id === schedule.id
            ? {
                ...currentSchedule,
                activo: newStatus,
              }
            : currentSchedule
        )
      )
    } catch (requestError) {
      setStatusError(requestError.message)
    } finally {
      setChangingScheduleId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Horarios de atención
          </h1>

          <p className="text-muted-foreground">
            Consulta el horario general del establecimiento
            para cada día de la semana.
          </p>
        </div>

        {isAdministrator && (
          <Button
            nativeButton={false}
            render={<Link to="/horarios/nuevo" />}
          >
            Nuevo horario
          </Button>
        )}
      </div>

            {statusError && (
        <Card>
          <CardContent className="p-4 text-center">
            <p
              role="alert"
              className="text-sm text-destructive"
            >
              {statusError}
            </p>
          </CardContent>
        </Card>
      )}

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

                                                    <div className="flex flex-wrap items-center gap-2">
                            <ActiveStatusBadge
                              active={schedule.activo}
                            />

                            {isAdministrator && (
                              <>
                                <Button
                                  nativeButton={false}
                                  size="sm"
                                  variant="outline"
                                  render={
                                    <Link
                                      to={`/horarios/${schedule.id}/editar`}
                                    />
                                  }
                                >
                                  Editar
                                </Button>

                                                                <AlertDialog>
                                  <AlertDialogTrigger
                                    render={
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant={
                                          schedule.activo
                                            ? "destructive"
                                            : "default"
                                        }
                                        disabled={
                                          changingScheduleId ===
                                          schedule.id
                                        }
                                      />
                                    }
                                  >
                                    {changingScheduleId ===
                                    schedule.id
                                      ? "Actualizando..."
                                      : schedule.activo
                                        ? "Desactivar"
                                        : "Activar"}
                                  </AlertDialogTrigger>

                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {schedule.activo
                                          ? "¿Desactivar este horario?"
                                          : "¿Activar este horario?"}
                                      </AlertDialogTitle>

                                      <AlertDialogDescription>
                                        {schedule.activo
                                          ? "El establecimiento dejará de atender durante este rango horario."
                                          : "El establecimiento volverá a atender durante este rango horario."}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                      <AlertDialogCancel
                                        disabled={
                                          changingScheduleId ===
                                          schedule.id
                                        }
                                      >
                                        Cancelar
                                      </AlertDialogCancel>

                                      <AlertDialogAction
                                        onClick={() =>
                                          handleStatusChange(
                                            schedule
                                          )
                                        }
                                        disabled={
                                          changingScheduleId ===
                                          schedule.id
                                        }
                                      >
                                        Confirmar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
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