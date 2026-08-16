import { useEffect, useMemo, useState } from "react"
import { ServiceCard } from "@/components/services/ServiceCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getServices,
  getSpecialties,
} from "@/services/serviceService"

async function requestServicesData() {
  const [servicesResponse, specialtiesResponse] = await Promise.all([
    getServices(),
    getSpecialties(),
  ])

  return {
    services: servicesResponse.data || [],
    specialties: specialtiesResponse.data || [],
  }
}

export function ServicesPage() {
  const [services, setServices] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [sortOrder, setSortOrder] = useState("nombre-asc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadData() {
  setLoading(true)
  setError("")

  try {
    const data = await requestServicesData()

    setServices(data.services)
    setSpecialties(data.specialties)
  } catch (requestError) {
    setError(requestError.message)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
  let isActive = true

  requestServicesData()
    .then((data) => {
      if (!isActive) {
        return
      }

      setServices(data.services)
      setSpecialties(data.specialties)
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
  const specialtiesById = useMemo(
    () =>
      Object.fromEntries(
        specialties.map((specialty) => [
          specialty.id,
          specialty.nombre,
        ])
      ),
    [specialties]
  )

  const sortedServices = useMemo(() => {
    return [...services].sort((firstService, secondService) => {
      if (sortOrder === "nombre-desc") {
        return secondService.nombre.localeCompare(firstService.nombre)
      }

      if (sortOrder === "precio-asc") {
        return (
          Number(firstService.precioBase) -
          Number(secondService.precioBase)
        )
      }

      if (sortOrder === "precio-desc") {
        return (
          Number(secondService.precioBase) -
          Number(firstService.precioBase)
        )
      }

      return firstService.nombre.localeCompare(secondService.nombre)
    })
  }, [services, sortOrder])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Servicios
          </h1>
          <p className="text-muted-foreground">
            Consulta las tutorías disponibles y sus características.
          </p>
        </div>

        <div className="w-full sm:w-56">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger aria-label="Ordenar servicios">
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

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="aspect-video w-full" />
              <CardContent className="space-y-3 p-6">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
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

            <Button type="button" onClick={loadData}>
              Intentar nuevamente
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && sortedServices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">No hay servicios registrados.</p>
            <p className="text-sm text-muted-foreground">
              Los servicios aparecerán aquí cuando sean registrados.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && sortedServices.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sortedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              specialtyName={
                specialtiesById[service.especialidadId]
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}