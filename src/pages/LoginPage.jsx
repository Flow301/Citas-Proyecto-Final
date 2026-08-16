import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

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

  function validateForm() {
    const newErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.correo.trim()) {
      newErrors.correo = "El correo electrónico es obligatorio."
    } else if (!emailPattern.test(formData.correo)) {
      newErrors.correo = "Ingresa un correo electrónico válido."
    } else if (formData.correo.length > 150) {
      newErrors.correo = "El correo no puede superar 150 caracteres."
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria."
    } else if (formData.password.length > 100) {
      newErrors.password = "La contraseña no puede superar 100 caracteres."
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError("")

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      await login({
        correo: formData.correo.trim(),
        password: formData.password,
      })

      navigate("/", { replace: true })
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
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Centro de Tutorías Académicas</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="correo">
                Correo electrónico{" "}
                <span className="text-destructive">*</span>
              </Label>

              <Input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                value={formData.correo}
                onChange={handleChange}
                aria-invalid={Boolean(errors.correo)}
                aria-describedby={
                  errors.correo ? "correo-error" : undefined
                }
                disabled={submitting}
              />

              {errors.correo && (
                <p
                  id="correo-error"
                  className="text-sm text-destructive"
                >
                  {errors.correo}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Contraseña <span className="text-destructive">*</span>
              </Label>

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                disabled={submitting}
              />

              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                render={<Link to="/registro" />}
              >
                Crear una cuenta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}