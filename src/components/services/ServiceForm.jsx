import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { getServiceImageUrl } from "@/services/serviceService"

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
]
const REQUIRE_SERVICE_IMAGE = true

const emptyValues = {
  nombre: "",
  descripcion: "",
  precioBase: "",
  duracionMinutos: "",
  especialidadId: "",
}

function validateService(values, imageFile, currentImage, mode) {
  const errors = {}
  const name = values.nombre.trim()
  const description = values.descripcion.trim()
  const price = Number(values.precioBase)
  const duration = Number(values.duracionMinutos)
  const specialtyId = Number(values.especialidadId)

  if (name.length < 3 || name.length > 120) {
    errors.nombre = "El nombre debe tener entre 3 y 120 caracteres."
  }

  if (description.length < 10 || description.length > 500) {
    errors.descripcion =
      "La descripción debe tener entre 10 y 500 caracteres."
  }

  if (
    values.precioBase === "" ||
    !Number.isFinite(price) ||
    price < 0.01 ||
    price > 99999999.99
  ) {
    errors.precioBase =
      "El precio debe estar entre 0.01 y 99,999,999.99."
  }

  if (
    values.duracionMinutos === "" ||
    !Number.isInteger(duration) ||
    duration < 15 ||
    duration > 480
  ) {
    errors.duracionMinutos =
      "La duración debe ser un número entero entre 15 y 480 minutos."
  }

  if (!Number.isInteger(specialtyId) || specialtyId < 1) {
    errors.especialidadId = "Selecciona una especialidad."
  }

  if (
    REQUIRE_SERVICE_IMAGE &&
    mode === "create" &&
    !imageFile
  ) {
    errors.imagen = "Selecciona una imagen para el servicio."
  }

  if (
    REQUIRE_SERVICE_IMAGE &&
    mode === "edit" &&
    !imageFile &&
    !currentImage
  ) {
    errors.imagen = "El servicio debe tener una imagen."
  }

  if (imageFile && !allowedImageTypes.includes(imageFile.type)) {
    errors.imagen = "La imagen debe ser JPG, JPEG, PNG o WEBP."
  }

  return errors
}

export function ServiceForm({
  mode,
  initialData,
  specialties,
  submitting,
  serverError,
  apiErrors = {},
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => ({
    ...emptyValues,
    nombre: initialData?.nombre || "",
    descripcion: initialData?.descripcion || "",
    precioBase: initialData?.precioBase || "",
    duracionMinutos: initialData?.duracionMinutos || "",
    especialidadId: initialData?.especialidadId
      ? String(initialData.especialidadId)
      : "",
  }))

  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [validationErrors, setValidationErrors] = useState({})

  const currentImage = initialData?.imagen || null
  const displayedImageUrl =
    previewUrl || getServiceImageUrl(currentImage)

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

  function handleSpecialtyChange(value) {
    setValues((currentValues) => ({
      ...currentValues,
      especialidadId: value,
    }))

    setValidationErrors((currentErrors) => ({
      ...currentErrors,
      especialidadId: undefined,
    }))
  }

  function handleImageChange(event) {
    const selectedFile = event.target.files?.[0] || null

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setImageFile(selectedFile)
    setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : "")

    setValidationErrors((currentErrors) => ({
      ...currentErrors,
      imagen: undefined,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newErrors = validateService(
      values,
      imageFile,
      currentImage,
      mode
    )

    setValidationErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    onSubmit({
      serviceData: {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim(),
        precioBase: Number(values.precioBase),
        duracionMinutos: Number(values.duracionMinutos),
        especialidadId: Number(values.especialidadId),
      },
      imageFile,
      previousFileName: currentImage,
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
        <FormField
          id="nombre"
          label="Nombre"
          required
          value={values.nombre}
          error={getError("nombre")}
          onChange={handleChange}
          disabled={submitting}
          minLength={3}
          maxLength={120}
        />

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
              aria-invalid={Boolean(getError("especialidadId"))}
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
            <p id="descripcion-help" className="text-muted-foreground">
              Describe claramente el contenido de la tutoría.
            </p>
          )}

          <span className="shrink-0 text-muted-foreground">
            {values.descripcion.length}/500
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="precioBase"
          label="Precio base"
          type="number"
          required
          value={values.precioBase}
          error={getError("precioBase")}
          onChange={handleChange}
          disabled={submitting}
          min="0.01"
          max="99999999.99"
          step="0.01"
        />

        <FormField
          id="duracionMinutos"
          label="Duración en minutos"
          type="number"
          required
          value={values.duracionMinutos}
          error={getError("duracionMinutos")}
          onChange={handleChange}
          disabled={submitting}
          min="15"
          max="480"
          step="1"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="imagen">
          Imagen representativa{" "}
          {REQUIRE_SERVICE_IMAGE && (
            <span className="text-destructive">*</span>
          )}
        </Label>

        <Input
          id="imagen"
          name="imagen"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={submitting || !REQUIRE_SERVICE_IMAGE}
          aria-invalid={Boolean(getError("imagen"))}
          aria-describedby={
            getError("imagen") ? "imagen-error" : "imagen-help"
          }
        />

        {getError("imagen") ? (
          <p id="imagen-error" className="text-sm text-destructive">
            {getError("imagen")}
          </p>
        ) : (
          <p id="imagen-help" className="text-sm text-muted-foreground">
            {REQUIRE_SERVICE_IMAGE
              ? "Formatos permitidos: JPG, JPEG, PNG y WEBP."
              : "Carga de imágenes deshabilitada temporalmente por un error del API."}
          </p>
        )}

        {displayedImageUrl && (
          <div className="overflow-hidden rounded-md border">
            <img
              src={displayedImageUrl}
              alt="Vista previa de la imagen del servicio"
              className="max-h-72 w-full object-contain bg-muted"
            />
          </div>
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
              ? "Crear servicio"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}

function FormField({
  id,
  label,
  type = "text",
  required,
  value,
  error,
  onChange,
  disabled,
  ...inputProps
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}{" "}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}