import { useEffect, useState } from "react"
import {
  Link,
  useNavigate,
  useParams,
} from "react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getScheduleById,
  getWeekDays,
  updateSchedule,
} from "@/services/scheduleService"

function formatTimeForInput(timeValue) {
  if (!timeValue) {
    return ""
  }

  const value = String(timeValue)

  if (value.includes("T")) {
    return value.slice(11, 16)
  }

  return value.slice(0, 5)
}

export function EditSchedulePage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [weekDays, setWeekDays] = useState([])
  const [formData, setFormData] = useState({
    diaSemanaId: "",
    horaInicio: "",
    horaFin: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let isActive = true

    Promise.all([
      getScheduleById(id),
      getWeekDays(),
    ])
      .then(([scheduleResponse, daysResponse]) => {
        if (!isActive) {
          return
        }

        const scheduleData = scheduleResponse.data

        setWeekDays(daysResponse.data ?? [])

        setFormData({
          diaSemanaId: String(
            scheduleData.diaSemanaId
          ),
          horaInicio: formatTimeForInput(
            scheduleData.horaInicio
          ),
          horaFin: formatTimeForInput(
            scheduleData.horaFin
          ),
        })
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

  function handleFieldChange(field, value) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))

    setError("")
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (!formData.diaSemanaId) {
      setError("Selecciona el día de la semana.")
      return
    }

    if (!formData.horaInicio || !formData.horaFin) {
      setError("Selecciona la hora inicial y final.")
      return
    }

    if (formData.horaInicio >= formData.horaFin) {
      setError(
        "La hora de finalización debe ser posterior a la hora inicial."
      )
      return
    }

    const requestData = {
      diaSemanaId: Number(formData.diaSemanaId),
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
    }

    setSubmitting(true)

    try {
      await updateSchedule(id, requestData)
      navigate("/horarios", { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Cargando formulario...
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button
        nativeButton={false}
        variant="outline"
        render={<Link to="/horarios" />}
      >
        Volver a horarios
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar horario de atención</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="diaSemanaId">
                Día de la semana
              </Label>

              <select
                id="diaSemanaId"
                value={formData.diaSemanaId}
                onChange={(event) =>
                  handleFieldChange(
                    "diaSemanaId",
                    event.target.value
                  )
                }
                className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                required
              >
                <option value="">
                  Selecciona un día
                </option>

                {[...weekDays]
                  .sort(
                    (first, second) =>
                      first.numeroOrden -
                      second.numeroOrden
                  )
                  .map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">
                  Hora inicial
                </Label>

                <Input
                  id="horaInicio"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(event) =>
                    handleFieldChange(
                      "horaInicio",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaFin">
                  Hora final
                </Label>

                <Input
                  id="horaFin"
                  type="time"
                  value={formData.horaFin}
                  onChange={(event) =>
                    handleFieldChange(
                      "horaFin",
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              El horario no puede traslaparse con otro horario
              activo del mismo día.
            </p>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Guardando..."
                : "Guardando cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}