import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ServiceForm } from "@/components/services/ServiceForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  createService,
  getServiceById,
  getSpecialties,
  updateService,
  uploadServiceImage,
} from "@/services/serviceService"

async function requestFormData(serviceId) {
  if (serviceId) {
    const [serviceResponse, specialtiesResponse] = await Promise.all([
      getServiceById(serviceId),
      getSpecialties(),
    ])

    return {
      service: serviceResponse.data,
      specialties: specialtiesResponse.data || [],
    }
  }

  const specialtiesResponse = await getSpecialties()

  return {
    service: null,
    specialties: specialtiesResponse.data || [],
  }
}

function mapValidationErrors(validationErrors) {
  return Object.fromEntries(
    validationErrors.map((validationError) => [
      validationError.field,
      validationError.message,
    ])
  )
}

export function ServiceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [service, setService] = useState(null)
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState("")
  const [apiErrors, setApiErrors] = useState({})

  useEffect(() => {
    let isActive = true

    requestFormData(id)
      .then((data) => {
        if (!isActive) {
          return
        }

        setService(data.service)
        setSpecialties(data.specialties)
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

  async function handleSubmit({
    serviceData,
    imageFile,
    previousFileName,
  }) {
    setSubmitting(true)
    setServerError("")
    setApiErrors({})

    try {
      let imageFileName = previousFileName || null

      if (imageFile) {
        const imageResponse = await uploadServiceImage(
          imageFile,
          isEditing ? previousFileName : undefined
        )

        imageFileName = imageResponse.fileName
      }

      const completeServiceData = {
        ...serviceData,
        imagen: imageFileName,
      }

      if (isEditing) {
        await updateService(id, completeServiceData)
      } else {
        await createService(completeServiceData)
      }

      navigate("/servicios", { replace: true })
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
    if (isEditing) {
      navigate(`/servicios/${id}`)
      return
    }

    navigate("/servicios")
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
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (loadError || (isEditing && !service)) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-8 text-center">
          <p role="alert" className="text-destructive">
            {loadError || "No se encontró el servicio."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar servicio" : "Crear servicio"}
        </CardTitle>

        <CardDescription>
          {isEditing
            ? "Modifica la información y la imagen representativa del servicio."
            : "Registra un nuevo servicio para el Centro de Tutorías."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ServiceForm
          mode={isEditing ? "edit" : "create"}
          initialData={service}
          specialties={specialties}
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