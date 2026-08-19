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
  getRestrictionById,
  getRestrictionTypes,
  updateRestriction,
} from "@/services/restrictionService"
import {
  getActiveEmployeesForService,
} from "@/services/appointmentService"

const initialFormData = {
  tipoRestriccionId: "",
  alcance: "global",
  empleadoId: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  todoElDia: false,
  motivo: "",
}

function formatDateForInput(dateValue) {
  if (!dateValue) {
    return ""
  }

  return String(dateValue).slice(0, 10)
}

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

export function EditRestrictionPage() {
  const navigate = useNavigate()
    const { id } = useParams()

  const [formData, setFormData] = useState(initialFormData)
  const [restrictionTypes, setRestrictionTypes] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

    useEffect(() => {
    let isActive = true

    Promise.all([
      getRestrictionById(id),
      getRestrictionTypes(),
      getActiveEmployeesForService(),
    ])
      .then(
        ([
          restrictionResponse,
          typesResponse,
          employeesResponse,
        ]) => {
          if (!isActive) {
            return
          }

          const restrictionData =
            restrictionResponse.data

          setRestrictionTypes(typesResponse.data ?? [])
          setEmployees(employeesResponse.data ?? [])

          setFormData({
            tipoRestriccionId: String(
              restrictionData.tipoRestriccionId
            ),
            alcance: restrictionData.empleadoId
              ? "empleado"
              : "global",
            empleadoId: restrictionData.empleadoId
              ? String(restrictionData.empleadoId)
              : "",
            fecha: formatDateForInput(
              restrictionData.fecha
            ),
            horaInicio: formatTimeForInput(
              restrictionData.horaInicio
            ),
            horaFin: formatTimeForInput(
              restrictionData.horaFin
            ),
            todoElDia: restrictionData.todoElDia,
            motivo: restrictionData.motivo ?? "",
          })
        }
      )
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
      ...(field === "alcance" && value === "global"
        ? { empleadoId: "" }
        : {}),
      ...(field === "todoElDia" && value
        ? {
            horaInicio: "",
            horaFin: "",
          }
        : {}),
    }))

    setError("")
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (!formData.tipoRestriccionId) {
      setError("Selecciona un tipo de restricción.")
      return
    }

    if (
      formData.alcance === "empleado" &&
      !formData.empleadoId
    ) {
      setError("Selecciona el empleado.")
      return
    }

    if (!formData.fecha) {
      setError("Selecciona la fecha.")
      return
    }

    if (
      !formData.todoElDia &&
      (!formData.horaInicio || !formData.horaFin)
    ) {
      setError("Selecciona la hora inicial y final.")
      return
    }

    if (
      !formData.todoElDia &&
      formData.horaInicio >= formData.horaFin
    ) {
      setError(
        "La hora de finalización debe ser posterior a la hora inicial."
      )
      return
    }

    if (formData.motivo.trim().length < 5) {
      setError(
        "El motivo debe contener al menos 5 caracteres."
      )
      return
    }

    const requestData = {
      tipoRestriccionId: Number(
        formData.tipoRestriccionId
      ),
      empleadoId:
        formData.alcance === "empleado"
          ? Number(formData.empleadoId)
          : null,
      fecha: formData.fecha,
      horaInicio: formData.todoElDia
        ? null
        : formData.horaInicio,
      horaFin: formData.todoElDia
        ? null
        : formData.horaFin,
      todoElDia: formData.todoElDia,
      motivo: formData.motivo.trim(),
    }

    setSubmitting(true)

    try {
      await updateRestriction(id, requestData)

navigate(`/restricciones/${id}`, {
  replace: true,
})
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
    <div className="mx-auto max-w-3xl space-y-4">
      <Button
        nativeButton={false}
        variant="outline"
        render={<Link to={`/restricciones/${id}`} />}
      >
        Volver al detalle
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar restricción</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="tipoRestriccionId">
                Tipo de restricción
              </Label>

              <select
                id="tipoRestriccionId"
                value={formData.tipoRestriccionId}
                onChange={(event) =>
                  handleFieldChange(
                    "tipoRestriccionId",
                    event.target.value
                  )
                }
                className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                required
              >
                <option value="">
                  Selecciona un tipo
                </option>

                {restrictionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alcance">
                Aplica a
              </Label>

              <select
                id="alcance"
                value={formData.alcance}
                onChange={(event) =>
                  handleFieldChange(
                    "alcance",
                    event.target.value
                  )
                }
                className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
              >
                <option value="global">
                  Todo el establecimiento
                </option>

                <option value="empleado">
                  Un empleado
                </option>
              </select>
            </div>

            {formData.alcance === "empleado" && (
              <div className="space-y-2">
                <Label htmlFor="empleadoId">
                  Empleado
                </Label>

                <select
                  id="empleadoId"
                  value={formData.empleadoId}
                  onChange={(event) =>
                    handleFieldChange(
                      "empleadoId",
                      event.target.value
                    )
                  }
                  className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                  required
                >
                  <option value="">
                    Selecciona un empleado
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {[
                        employee.usuario?.nombre,
                        employee.usuario?.primerApellido,
                        employee.usuario?.segundoApellido,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>

              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(event) =>
                  handleFieldChange(
                    "fecha",
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="todoElDia"
                type="checkbox"
                checked={formData.todoElDia}
                onChange={(event) =>
                  handleFieldChange(
                    "todoElDia",
                    event.target.checked
                  )
                }
                className="size-4"
              />

              <Label htmlFor="todoElDia">
                Aplicar durante todo el día
              </Label>
            </div>

            {!formData.todoElDia && (
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
            )}

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>

              <textarea
                id="motivo"
                value={formData.motivo}
                onChange={(event) =>
                  handleFieldChange(
                    "motivo",
                    event.target.value
                  )
                }
                minLength={5}
                maxLength={255}
                className="min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                placeholder="Describe el motivo de la restricción"
                required
              />

              <p className="text-xs text-muted-foreground">
                {formData.motivo.length}/255
              </p>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Guardando..."
                : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}