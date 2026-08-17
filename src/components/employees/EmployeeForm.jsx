import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const emptyValues = {
  usuarioId: "",
  especialidadId: "",
  codigoEmpleado: "",
  descripcion: "",
  servicioIds: [],
}

function getUserFullName(user) {
  return [
    user.nombre,
    user.primerApellido,
    user.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
}

function validateEmployee(values) {
  const errors = {}
  const userId = Number(values.usuarioId)
  const specialtyId = Number(values.especialidadId)
  const code = values.codigoEmpleado.trim()
  const description = values.descripcion.trim()

  if (!Number.isInteger(userId) || userId < 1) {
    errors.usuarioId = "Selecciona un usuario."
  }

  if (!Number.isInteger(specialtyId) || specialtyId < 1) {
    errors.especialidadId = "Selecciona una especialidad."
  }

  if (code.length < 3 || code.length > 30) {
    errors.codigoEmpleado =
      "El código debe tener entre 3 y 30 caracteres."
  } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {
    errors.codigoEmpleado =
      "El código solo puede contener letras, números, guiones y guion bajo."
  }

  if (
    description.length > 0 &&
    (description.length < 3 || description.length > 500)
  ) {
    errors.descripcion =
      "La descripción debe estar vacía o tener entre 3 y 500 caracteres."
  }

  if (values.servicioIds.length === 0) {
    errors.servicioIds =
      "Selecciona al menos un servicio."
  }

  return errors
}

export function EmployeeForm({
  mode = "create",
  initialData,
  users,
  specialties,
  services,
  submitting,
  serverError,
  apiErrors = {},
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => ({
    ...emptyValues,
    usuarioId: initialData?.usuarioId
      ? String(initialData.usuarioId)
      : "",
    especialidadId: initialData?.especialidadId
      ? String(initialData.especialidadId)
      : "",
    codigoEmpleado: initialData?.codigoEmpleado || "",
    descripcion: initialData?.descripcion || "",
    servicioIds:
      initialData?.servicios?.map((service) => service.id) || [],
  }))

  const [validationErrors, setValidationErrors] = useState({})

  const compatibleServices = useMemo(() => {
    if (!values.especialidadId) {
      return []
    }

    const specialtyId = Number(values.especialidadId)

    return services.filter(
      (service) => service.especialidadId === specialtyId
    )
  }, [services, values.especialidadId])

  function clearError(fieldName) {
    setValidationErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
    }))
  }

  function handleChange(event) {
    const { name, value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    clearError(name)
  }

  function handleUserChange(value) {
    setValues((currentValues) => ({
      ...currentValues,
      usuarioId: value,
    }))

    clearError("usuarioId")
  }

  function handleSpecialtyChange(value) {
    const specialtyId = Number(value)

    setValues((currentValues) => ({
      ...currentValues,
      especialidadId: value,
      servicioIds: currentValues.servicioIds.filter(
        (serviceId) => {
          const service = services.find(
            (item) => item.id === serviceId
          )

          return service?.especialidadId === specialtyId
        }
      ),
    }))

    clearError("especialidadId")
    clearError("servicioIds")
  }

  function handleServiceChange(serviceId, checked) {
    setValues((currentValues) => {
      const selectedServices = checked
        ? [...currentValues.servicioIds, serviceId]
        : currentValues.servicioIds.filter(
            (currentId) => currentId !== serviceId
          )

      return {
        ...currentValues,
        servicioIds: [...new Set(selectedServices)],
      }
    })

    clearError("servicioIds")
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newErrors = validateEmployee(values)
    setValidationErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    const description = values.descripcion.trim()

    onSubmit({
      usuarioId: Number(values.usuarioId),
      especialidadId: Number(values.especialidadId),
      codigoEmpleado: values.codigoEmpleado.trim(),
      descripcion: description || null,
      servicioIds: values.servicioIds,
    })
  }

  function getError(fieldName) {
    return validationErrors[fieldName] || apiErrors[fieldName]
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="usuarioId">
            Usuario <span className="text-destructive">*</span>
          </Label>

          <Select
            value={values.usuarioId}
            onValueChange={handleUserChange}
            disabled={submitting}
          >
            <SelectTrigger
              id="usuarioId"
              aria-invalid={Boolean(getError("usuarioId"))}
              aria-describedby={
                getError("usuarioId")
                  ? "usuarioId-error"
                  : undefined
              }
            >
              <SelectValue placeholder="Selecciona un usuario" />
            </SelectTrigger>

            <SelectContent>
              {users.map((user) => (
                <SelectItem
                  key={user.id}
                  value={String(user.id)}
                >
                  {getUserFullName(user)} — {user.correo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {getError("usuarioId") && (
            <p
              id="usuarioId-error"
              className="text-sm text-destructive"
            >
              {getError("usuarioId")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="especialidadId">
            Especialidad{" "}
            <span className="text-destructive">*</span>
          </Label>

          <Select
            value={values.especialidadId}
            onValueChange={handleSpecialtyChange}
            disabled={submitting}
          >
            <SelectTrigger
              id="especialidadId"
              aria-invalid={Boolean(
                getError("especialidadId")
              )}
              aria-describedby={
                getError("especialidadId")
                  ? "especialidadId-error"
                  : undefined
              }
            >
              <SelectValue placeholder="Selecciona una especialidad" />
            </SelectTrigger>

            <SelectContent>
              {specialties.map((specialty) => (
                <SelectItem
                  key={specialty.id}
                  value={String(specialty.id)}
                >
                  {specialty.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {getError("especialidadId") && (
            <p
              id="especialidadId-error"
              className="text-sm text-destructive"
            >
              {getError("especialidadId")}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="codigoEmpleado">
          Código de empleado{" "}
          <span className="text-destructive">*</span>
        </Label>

        <Input
          id="codigoEmpleado"
          name="codigoEmpleado"
          value={values.codigoEmpleado}
          onChange={handleChange}
          disabled={submitting}
          minLength={3}
          maxLength={30}
          placeholder="Ejemplo: TUT-MAT-004"
          aria-invalid={Boolean(
            getError("codigoEmpleado")
          )}
          aria-describedby={
            getError("codigoEmpleado")
              ? "codigoEmpleado-error"
              : "codigoEmpleado-help"
          }
        />

        {getError("codigoEmpleado") ? (
          <p
            id="codigoEmpleado-error"
            className="text-sm text-destructive"
          >
            {getError("codigoEmpleado")}
          </p>
        ) : (
          <p
            id="codigoEmpleado-help"
            className="text-sm text-muted-foreground"
          >
            Utiliza letras, números, guiones o guion bajo.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">
          Descripción
        </Label>

        <Textarea
          id="descripcion"
          name="descripcion"
          value={values.descripcion}
          onChange={handleChange}
          disabled={submitting}
          rows={4}
          maxLength={500}
          aria-invalid={Boolean(getError("descripcion"))}
          aria-describedby={
            getError("descripcion")
              ? "descripcion-error"
              : "descripcion-help"
          }
        />

        <div className="flex justify-between gap-4 text-sm">
          {getError("descripcion") ? (
            <p
              id="descripcion-error"
              className="text-destructive"
            >
              {getError("descripcion")}
            </p>
          ) : (
            <p
              id="descripcion-help"
              className="text-muted-foreground"
            >
              Este campo es opcional.
            </p>
          )}

          <span className="shrink-0 text-muted-foreground">
            {values.descripcion.length}/500
          </span>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="font-medium">
          Servicios que puede atender{" "}
          <span className="text-destructive">*</span>
        </legend>

        {!values.especialidadId && (
          <p className="text-sm text-muted-foreground">
            Selecciona primero una especialidad.
          </p>
        )}

        {values.especialidadId &&
          compatibleServices.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No existen servicios para la especialidad seleccionada.
            </p>
          )}

        {compatibleServices.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {compatibleServices.map((service) => {
              const checked = values.servicioIds.includes(
                service.id
              )

              const disabled =
                submitting || (!service.activo && !checked)

              return (
                <Label
                  key={service.id}
                  className="flex items-start gap-3 rounded-md border p-4"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(newChecked) =>
                      handleServiceChange(
                        service.id,
                        newChecked === true
                      )
                    }
                    disabled={disabled}
                  />

                  <span className="space-y-1">
                    <span className="block font-medium">
                      {service.nombre}
                    </span>

                    <span className="block text-sm font-normal text-muted-foreground">
                      {service.duracionMinutos} minutos
                      {!service.activo && " — Inactivo"}
                    </span>
                  </span>
                </Label>
              )
            })}
          </div>
        )}

        {getError("servicioIds") && (
          <p className="text-sm text-destructive">
            {getError("servicioIds")}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>

        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Guardando..."
            : mode === "create"
              ? "Crear empleado"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}