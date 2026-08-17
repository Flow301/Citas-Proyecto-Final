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

function formatPrice(price) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(price))
}

export function AdditionalServiceCard({ additional }) {
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

      <CardFooter>
        <Button
          nativeButton={false}
          className="w-full"
          variant="outline"
          render={
            <Link
              to={`/servicios-adicionales/${additional.id}`}
            />
          }
        >
          Ver detalle
        </Button>
      </CardFooter>
    </Card>
  )
}