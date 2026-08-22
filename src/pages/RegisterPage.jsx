import { useState } from "react"
import { Link } from "react-router"
import { registerClient } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialFormData = {
  nombre: "",
  primerApellido: "",
  segundoApellido: "",
  correo: "",
  telefono: "",
  password: "",
  confirmPassword: "",
}

export function RegisterPage() {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }))
  }

  function validateTextField(value, fieldName, label, required = true) {
    const trimmedValue = value.trim()

    if (required && !trimmedValue) {
      return `${label} es obligatorio.`
    }

    if (trimmedValue && trimmedValue.length < 2) {
      return `${label} debe tener al menos 2 caracteres.`
    }

    if (trimmedValue.length > 100) {
      return `${label} no puede superar 100 caracteres.`
    }

    return ""
  }

  function validateForm() {
    const newErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phonePattern = /^[0-9+\-()\s]+$/
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

    newErrors.nombre = validateTextField(
      formData.nombre,
      "nombre",
      "El nombre"
    )

    newErrors.primerApellido = validateTextField(
      formData.primerApellido,
      "primerApellido",
      "El primer apellido"
    )

    newErrors.segundoApellido = validateTextField(
      formData.segundoApellido,
      "segundoApellido",
      "El segundo apellido",
      false
    )

    if (!formData.correo.trim()) {
      newErrors.correo = "El correo electrónico es obligatorio."
    } else if (!emailPattern.test(formData.correo)) {
      newErrors.correo = "Ingresa un correo electrónico válido."
    } else if (formData.correo.length > 150) {
      newErrors.correo = "El correo no puede superar 150 caracteres."
    }

    const trimmedPhone = formData.telefono.trim()

    if (trimmedPhone && trimmedPhone.length < 8) {
      newErrors.telefono = "El teléfono debe tener al menos 8 caracteres."
    } else if (trimmedPhone.length > 25) {
      newErrors.telefono = "El teléfono no puede superar 25 caracteres."
    } else if (trimmedPhone && !phonePattern.test(trimmedPhone)) {
      newErrors.telefono =
        "El teléfono solo puede contener números, espacios, +, -, ( y )."
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria."
    } else if (formData.password.length < 8) {
      newErrors.password =
        "La contraseña debe tener al menos 8 caracteres."
    } else if (formData.password.length > 100) {
      newErrors.password =
        "La contraseña no puede superar 100 caracteres."
    } else if (!passwordPattern.test(formData.password)) {
      newErrors.password =
        "Debe incluir una mayúscula, una minúscula y un número."
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma la contraseña."
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Las contraseñas no coinciden."
    }

    Object.keys(newErrors).forEach((field) => {
      if (!newErrors[field]) {
        delete newErrors[field]
      }
    })

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError("")
    setSuccessMessage("")

    if (!validateForm()) {
      return
    }

    const clientData = {
      nombre: formData.nombre.trim(),
      primerApellido: formData.primerApellido.trim(),
      correo: formData.correo.trim(),
      password: formData.password,
    }

    if (formData.segundoApellido.trim()) {
      clientData.segundoApellido = formData.segundoApellido.trim()
    }

    if (formData.telefono.trim()) {
      clientData.telefono = formData.telefono.trim()
    }

    setSubmitting(true)

    try {
      const response = await registerClient(clientData)

      setSuccessMessage(
        response.message || "Cliente registrado correctamente."
      )
      setFormData(initialFormData)
      setErrors({})
    } catch (error) {
      if (error.validationErrors?.length > 0) {
        const apiErrors = {}

        error.validationErrors.forEach((validationError) => {
          apiErrors[validationError.field] = validationError.message
        })

        setErrors(apiErrors)
      } else {
        setServerError(error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Crear cuenta de estudiante</CardTitle>
          <CardDescription>
            Regístrate como cliente del Centro de Tutorías Académicas.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {serverError}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700"
              >
                {successMessage}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="nombre"
                label="Nombre"
                required
                value={formData.nombre}
                error={errors.nombre}
                onChange={handleChange}
                disabled={submitting}
              />

              <FormField
                id="primerApellido"
                label="Primer apellido"
                required
                value={formData.primerApellido}
                error={errors.primerApellido}
                onChange={handleChange}
                disabled={submitting}
              />

              <FormField
                id="segundoApellido"
                label="Segundo apellido"
                value={formData.segundoApellido}
                error={errors.segundoApellido}
                onChange={handleChange}
                disabled={submitting}
              />

              <FormField
                id="telefono"
                label="Teléfono"
                type="tel"
                value={formData.telefono}
                error={errors.telefono}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <FormField
              id="correo"
              label="Correo electrónico"
              type="email"
              required
              autoComplete="email"
              value={formData.correo}
              error={errors.correo}
              onChange={handleChange}
              disabled={submitting}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="password"
                label="Contraseña"
                type="password"
                required
                autoComplete="new-password"
                value={formData.password}
                error={errors.password}
                onChange={handleChange}
                disabled={submitting}
              />

              <FormField
                id="confirmPassword"
                label="Confirmar contraseña"
                type="password"
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                error={errors.confirmPassword}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              La contraseña debe tener entre 8 y 100 caracteres e incluir
              una mayúscula, una minúscula y un número.
            </p>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <div className="text-center">
              <Button
                nativeButton={false}
                variant="link"
                render={<Link to="/login" />}
              >
                Ya tengo una cuenta
              </Button>
            </div>
          </form>

          <div className="mt-5 border-t pt-5">
            <Button
              nativeButton={false}
              variant="outline"
              className="w-full"
              render={<Link to="/" />}
            >
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function FormField({
  id,
  label,
  type = "text",
  required = false,
  autoComplete,
  value,
  error,
  onChange,
  disabled,
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
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}