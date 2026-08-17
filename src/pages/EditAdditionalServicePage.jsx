import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { AdditionalServiceForm } from "@/components/additionals/AdditionalServiceForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getAdditionalServiceById,
  updateAdditionalService,
} from "@/services/additionalService"

async function requestAdditionalService(additionalId) {
  const response =
    await getAdditionalServiceById(additionalId)

  return response.data
}

function mapValidationErrors(validationErrors) {
  return Object.fromEntries(
    validationErrors.map((validationError) => [
      validationError.field,
      validationError.message,
    ])
  )
}

export function EditAdditionalServicePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [additional, setAdditional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState("")
  const [apiErrors, setApiErrors] = useState({})

  useEffect(() => {
    let isActive = true

    requestAdditionalService(id)
      .then((data) => {
        if (isActive) {
          setAdditional(data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setLoadError(requestError.message)
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

  async function handleSubmit(additionalData) {
    setSubmitting(true)
    setServerError("")
    setApiErrors({})

    try {
      await updateAdditionalService(id, additionalData)
      navigate(`/servicios-adicionales/${id}`, {
        replace: true,
      })
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
    navigate(`/servicios-adicionales/${id}`)
  }

  if (loading) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>

        <CardContent className="space-y-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (loadError || !additional) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-8 text-center">
          <p role="alert" className="text-destructive">
            {loadError ||
              "No se encontró el servicio adicional."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Editar servicio adicional</CardTitle>

        <CardDescription>
          Modifica la información del complemento seleccionado.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AdditionalServiceForm
          mode="edit"
          initialData={additional}
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