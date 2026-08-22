import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import { useAuth } from "@/context/auth-context"
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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  changeAdditionalServiceStatus,
  getAdditionalServiceById,
} from "@/services/additionalService"

function formatPrice(price) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(price))
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "No disponible"
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
  }).format(new Date(dateValue))
}

async function requestAdditionalService(additionalId) {
  const response =
    await getAdditionalServiceById(additionalId)

  return response.data
}

export function AdditionalServiceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()

  const [additional, setAdditional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [changingStatus, setChangingStatus] = useState(false)
  const [statusError, setStatusError] = useState("")

  const isAdministrator =
    user?.rol?.nombre === "Administrador"

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

  async function handleStatusChange() {
    const newStatus = !additional.activo

    setChangingStatus(true)
    setStatusError("")

    try {
      await changeAdditionalServiceStatus(
        additional.id,
        newStatus
      )

      setAdditional((currentAdditional) => ({
        ...currentAdditional,
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
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>

        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-8 w-1/3" />
        </CardContent>
      </Card>
    )
  }

  if (error || !additional) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="space-y-4 p-8 text-center">
          <p role="alert" className="text-destructive">
            {error ||
              "No se encontró el servicio adicional."}
          </p>

          <Button
            nativeButton={false}
            variant="outline"
            render={<Link to="/servicios-adicionales" />}
          >
            Volver a adicionales
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!additional.activo && !isAdministrator) {
  return (
    <Card className="mx-auto max-w-3xl">
      <CardContent className="space-y-4 p-8 text-center">
        <p className="font-medium">
          Este servicio adicional no está disponible
          actualmente.
        </p>

        <p className="text-sm text-muted-foreground">
          Consulta los demás servicios adicionales activos.
        </p>

        <Button
          nativeButton={false}
          variant="outline"
          render={<Link to="/servicios-adicionales" />}
        >
          Volver a adicionales
        </Button>
      </CardContent>
    </Card>
  )
}

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link to="/servicios-adicionales" />}
        >
          Volver a adicionales
        </Button>

        {isAdministrator && (
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              variant="outline"
              render={
                <Link
                  to={`/servicios-adicionales/${additional.id}/editar`}
                />
              }
            >
              Editar adicional
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant={
                      additional.activo
                        ? "destructive"
                        : "default"
                    }
                    disabled={changingStatus}
                  />
                }
              >
                {changingStatus
                  ? "Actualizando..."
                  : additional.activo
                    ? "Desactivar adicional"
                    : "Activar adicional"}
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {additional.activo
                      ? "¿Desactivar este adicional?"
                      : "¿Activar este adicional?"}
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    {additional.activo
                      ? "El adicional dejará de estar disponible para nuevas citas, pero permanecerá en el historial."
                      : "El adicional volverá a estar disponible para nuevas citas."}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={changingStatus}
                  >
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

      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <CardTitle className="text-2xl">
              {additional.nombre}
            </CardTitle>

            <ActiveStatusBadge
              active={additional.activo}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Descripción
            </p>

            <p className="leading-7">
              {additional.descripcion}
            </p>
          </div>

          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">
                Precio adicional
              </dt>

              <dd className="font-semibold">
                {formatPrice(additional.precio)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Fecha de registro
              </dt>

              <dd className="font-semibold">
                {formatDate(additional.creadoEn)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}