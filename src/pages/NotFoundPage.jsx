import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        Error 404
      </p>

      <h1 className="text-3xl font-bold">Página no encontrada</h1>

      <p className="text-muted-foreground">
        La dirección solicitada no existe.
      </p>

      <Button render={<Link to="/" />}>
        Volver al inicio
      </Button>
    </main>
  )
}