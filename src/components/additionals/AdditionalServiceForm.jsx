import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialValues = {
  nombre: "",
  descripcion: "",
  precio: "",
}

function validateAdditional(values) {
  const errors = {}
  const name = values.nombre.trim()
  const description = values.descripcion.trim()
  const price = Number(values.precio)

  if (name.length < 3 || name.length > 120) {
    errors.nombre =
      "El nombre debe tener entre 3 y 120 caracteres."
  }

  if (description.length < 10 || description.length > 500) {
    errors.descripcion =
      "La descripción debe tener entre 10 y 500 caracteres."
  }

  if (
    values.precio === "" ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 99999999.99
  ) {
    errors.precio =
      "El precio debe estar entre 0 y 99,999,999.99."
  }

  return errors
}

export function AdditionalServiceForm({
  mode = "create",
  initialData,
  submitting,
  serverError,
  apiErrors = {},
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => ({
    ...initialValues,
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    precio: initialData?.precio ?? "",
  }))
  const [validationErrors, setValidationErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    setValidationErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newErrors = validateAdditional(values)
    setValidationErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    onSubmit({
      nombre: values.nombre.trim(),
      descripcion: values.descripcion.trim(),
      precio: Number(values.precio),
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

      <div className="space-y-2">
        <Label htmlFor="nombre">
          Nombre <span className="text-destructive">*</span>
        </Label>

        <Input
          id="nombre"
          name="nombre"
          value={values.nombre}
          onChange={handleChange}
          disabled={submitting}
          minLength={3}
          maxLength={120}
          aria-invalid={Boolean(getError("nombre"))}
          aria-describedby={
            getError("nombre") ? "nombre-error" : undefined
          }
        />

        {getError("nombre") && (
          <p id="nombre-error" className="text-sm text-destructive">
            {getError("nombre")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">
          Descripción <span className="text-destructive">*</span>
        </Label>

        <Textarea
          id="descripcion"
          name="descripcion"
          value={values.descripcion}
          onChange={handleChange}
          disabled={submitting}
          rows={5}
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
            <p id="descripcion-error" className="text-destructive">
              {getError("descripcion")}
            </p>
          ) : (
            <p
              id="descripcion-help"
              className="text-muted-foreground"
            >
              Explica qué agrega este adicional a la cita.
            </p>
          )}

          <span className="shrink-0 text-muted-foreground">
            {values.descripcion.length}/500
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="precio">
          Precio adicional{" "}
          <span className="text-destructive">*</span>
        </Label>

        <Input
          id="precio"
          name="precio"
          type="number"
          value={values.precio}
          onChange={handleChange}
          disabled={submitting}
          min="0"
          max="99999999.99"
          step="0.01"
          aria-invalid={Boolean(getError("precio"))}
          aria-describedby={
            getError("precio") ? "precio-error" : undefined
          }
        />

        {getError("precio") && (
          <p id="precio-error" className="text-sm text-destructive">
            {getError("precio")}
          </p>
        )}
      </div>

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
              ? "Crear adicional"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}