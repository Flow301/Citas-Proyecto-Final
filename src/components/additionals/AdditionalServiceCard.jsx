import { Link } from "react-router"
import { ActiveStatusBadge } from "@/components/common/ActiveStatusBadge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function formatPrice(price) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(price))
}

export function AdditionalServiceCard({ additional }) {
  const { user } = useAuth()
  const isAdministrator =
    user?.rol?.nombre === "Administrador"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">
            {additional.nombre}
          </CardTitle>

          <ActiveStatusBadge active={additional.activo} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {additional.descripcion}
        </p>

        <div>
          <p className="text-sm text-muted-foreground">
            Precio adicional
          </p>

          <p className="font-semibold">
            {formatPrice(additional.precio)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button
          nativeButton={false}
          className="flex-1"
          variant="outline"
          render={
            <Link
              to={`/servicios-adicionales/${additional.id}`}
            />
          }
        >
          Ver detalle
        </Button>

        {isAdministrator && (
          <Button
            nativeButton={false}
            className="flex-1"
            render={
              <Link
                to={`/servicios-adicionales/${additional.id}/editar`}
              />
            }
          >
            Editar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}