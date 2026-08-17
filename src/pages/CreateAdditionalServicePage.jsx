import { useState } from "react"
import { useNavigate } from "react-router"
import { AdditionalServiceForm } from "@/components/additionals/AdditionalServiceForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createAdditionalService } from "@/services/additionalService"

function mapValidationErrors(validationErrors) {
  return Object.fromEntries(
    validationErrors.map((validationError) => [
      validationError.field,
      validationError.message,
    ])
  )
}

export function CreateAdditionalServicePage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState("")
  const [apiErrors, setApiErrors] = useState({})

  async function handleSubmit(additionalData) {
    setSubmitting(true)
    setServerError("")
    setApiErrors({})

    try {
      await createAdditionalService(additionalData)
      navigate("/servicios-adicionales", { replace: true })
    } catch (requestError) {
      if (requestError.validationErrors?.length > 0) {
        setApiErrors(
          mapValidationErrors(requestError.validationErrors)
        )
      } else {
        setServerError(requestError.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    navigate("/servicios-adicionales")
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Crear servicio adicional</CardTitle>

        <CardDescription>
          Registra un complemento que podrá agregarse a las citas.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AdditionalServiceForm
          submitting={submitting}
          serverError={serverError}
          apiErrors={apiErrors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  )
}