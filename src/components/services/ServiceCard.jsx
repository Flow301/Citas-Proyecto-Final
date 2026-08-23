import { Link } from "react-router"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getServiceImageUrl } from "@/services/serviceService"
import { useAuth } from "@/context/auth-context"

function formatPrice(price) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(price))
}

export function ServiceCard({ service, specialtyName }) {
  const { user } = useAuth()
  const imageUrl = getServiceImageUrl(service.imagen)
  const isAdministrator =
    user?.rol?.nombre === "Administrador"

  return (
    <Card className="overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Imagen de ${service.nombre}`}
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-muted text-sm text-muted-foreground">
          Imagen no disponible
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{service.nombre}</CardTitle>
          <ActiveStatusBadge active={service.activo} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {service.descripcion}
        </p>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Precio</dt>
            <dd className="font-medium">
              {formatPrice(service.precioBase)}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground">Duración</dt>
            <dd className="font-medium">
              {service.duracionMinutos} minutos
            </dd>
          </div>

          <div className="col-span-2">
            <dt className="text-muted-foreground">Especialidad</dt>
            <dd className="font-medium">
              {specialtyName || "No disponible"}
            </dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          className="flex-1"
          variant="outline"
          render={<Link to={`/servicios/${service.id}`} />}
          nativeButton={false}
        >
          Ver detalle
        </Button>

        {isAdministrator && (
          <Button
            className="flex-1"
            render={
              <Link to={`/servicios/${service.id}/editar`} />
            }
            nativeButton={false}
          >
            Editar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}