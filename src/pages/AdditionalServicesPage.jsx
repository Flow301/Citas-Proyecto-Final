import { useEffect, useMemo, useState } from "react"
import { AdditionalServiceCard } from "@/components/additionals/AdditionalServiceCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getAdditionalServices } from "@/services/additionalService"
import { Link } from "react-router"
import { useAuth } from "@/context/auth-context"

async function requestAdditionalServices() {
  const response = await getAdditionalServices()
  return response.data || []
}

export function AdditionalServicesPage() {
  const { user } = useAuth()
  const isAdministrator = user.rol?.nombre === "Administrador"
  const [additionals, setAdditionals] = useState([])
  const [sortOrder, setSortOrder] = useState("nombre-asc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  function loadAdditionals() {
    setLoading(true)
    setError("")

    requestAdditionalServices()
      .then((data) => {
        setAdditionals(data)
      })
      .catch((requestError) => {
        setError(requestError.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    let isActive = true

    requestAdditionalServices()
      .then((data) => {
        if (isActive) {
          setAdditionals(data)
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
  }, [])

  const sortedAdditionals = useMemo(() => {
    return [...additionals].sort((firstAdditional, secondAdditional) => {
      if (sortOrder === "nombre-desc") {
        return secondAdditional.nombre.localeCompare(
          firstAdditional.nombre
        )
      }

      if (sortOrder === "precio-asc") {
        return (
          Number(firstAdditional.precio) -
          Number(secondAdditional.precio)
        )
      }

      if (sortOrder === "precio-desc") {
        return (
          Number(secondAdditional.precio) -
          Number(firstAdditional.precio)
        )
      }

      return firstAdditional.nombre.localeCompare(
        secondAdditional.nombre
      )
    })
  }, [additionals, sortOrder])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Servicios adicionales
          </h1>

          <p className="text-muted-foreground">
            Consulta los complementos disponibles para las citas.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {isAdministrator && (
            <Button
              nativeButton={false}
              render={
                <Link to="/servicios-adicionales/nuevo" />
              }
            >
              Crear adicional
            </Button>
          )}

          <div className="w-full sm:w-56">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger aria-label="Ordenar servicios adicionales">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="nombre-asc">
                  Nombre: A-Z
                </SelectItem>

                <SelectItem value="nombre-desc">
                  Nombre: Z-A
                </SelectItem>

                <SelectItem value="precio-asc">
                  Menor precio
                </SelectItem>

                <SelectItem value="precio-desc">
                  Mayor precio
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && error && (
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>

            <Button type="button" onClick={loadAdditionals}>
              Intentar nuevamente
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && sortedAdditionals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">
              No hay servicios adicionales registrados.
            </p>

            <p className="text-sm text-muted-foreground">
              Los adicionales aparecerán aquí cuando sean registrados.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && sortedAdditionals.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sortedAdditionals.map((additional) => (
            <AdditionalServiceCard
              key={additional.id}
              additional={additional}
            />
          ))}
        </div>
      )}
    </div>
  )
}