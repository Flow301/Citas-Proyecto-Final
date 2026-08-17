import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  changeServiceStatus,
  getServiceById,
  getServiceImageUrl,
  getSpecialties,
} from "@/services/serviceService"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function formatPrice(price) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(price))
}

export function ServiceDetailPage() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [specialtyName, setSpecialtyName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [changingStatus, setChangingStatus] = useState(false)
  const [statusError, setStatusError] = useState("")
  const { user } = useAuth()
  const isAdministrator = user.rol?.nombre === "Administrador"

  useEffect(() => {
    async function loadService() {
      setLoading(true)
      setError("")

      try {
        const [serviceResponse, specialtiesResponse] =
          await Promise.all([
            getServiceById(id),
            getSpecialties(),
          ])

        const serviceData = serviceResponse.data
        const specialties = specialtiesResponse.data || []
        const specialty = specialties.find(
          (item) => item.id === serviceData.especialidadId
        )

        setService(serviceData)
        setSpecialtyName(specialty?.nombre || "No disponible")
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [id])

  async function handleStatusChange() {
    const newStatus = !service.activo

    setChangingStatus(true)
    setStatusError("")

    try {
      await changeServiceStatus(service.id, newStatus)

      setService((currentService) => ({
        ...currentService,
        activo: newStatus,
      }))
    } catch (requestError) {
      setStatusError(requestError.message)
    } finally {
      setChangingStatus(false)
    }
  }

  if (loading) {
    return (
      <Card className="mx-auto max-w-4xl">
        <Skeleton className="aspect-video w-full" />
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
      </Card>
    )
  }

  if (error || !service) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <p role="alert" className="text-destructive">
            {error || "No se encontró el servicio."}
          </p>

          <Button
            variant="outline"
            render={<Link to="/servicios" />}
          >
            Volver a servicios
          </Button>
        </CardContent>
      </Card>
    )
  }

  const imageUrl = getServiceImageUrl(service.imagen)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link to="/servicios" />}
        >
          Volver a servicios
        </Button>

        {isAdministrator && (
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link to={`/servicios/${service.id}/editar`} />}
            >
              Editar servicio
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant={service.activo ? "destructive" : "default"}
                    disabled={changingStatus}
                  />
                }
              >
                {changingStatus
                  ? "Actualizando..."
                  : service.activo
                    ? "Desactivar servicio"
                    : "Activar servicio"}
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {service.activo
                      ? "¿Desactivar este servicio?"
                      : "¿Activar este servicio?"}
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    {service.activo
                      ? "El servicio dejará de estar disponible para registrar nuevas citas."
                      : "El servicio volverá a estar disponible para registrar nuevas citas."}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={changingStatus}>
                    Cancelar
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={handleStatusChange}
                    disabled={changingStatus}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {statusError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {statusError}
        </div>
      )}

      <Card className="mx-auto max-w-4xl overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Imagen de ${service.nombre}`}
            className="max-h-96 w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
            Imagen no disponible
          </div>
        )}

        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <CardTitle className="text-2xl">
              {service.nombre}
            </CardTitle>

            <ActiveStatusBadge active={service.activo} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="leading-7">{service.descripcion}</p>

          <dl className="grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">Precio</dt>
              <dd className="font-semibold">
                {formatPrice(service.precioBase)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Duración
              </dt>
              <dd className="font-semibold">
                {service.duracionMinutos} minutos
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Especialidad
              </dt>
              <dd className="font-semibold">{specialtyName}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}