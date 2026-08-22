import { useEffect, useMemo, useState } from "react"
import { ServiceCard } from "@/components/services/ServiceCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router"
import { useAuth } from "@/context/auth-context"
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

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function ServicesPage() {
  const [services, setServices] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [sortOrder, setSortOrder] = useState("nombre-asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [specialtyFilter, setSpecialtyFilter] =
    useState("todas")
  const [minimumPrice, setMinimumPrice] = useState("")
  const [maximumPrice, setMaximumPrice] = useState("")
  const [minimumDuration, setMinimumDuration] =
    useState("")
  const [maximumDuration, setMaximumDuration] =
    useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const isAdministrator =
    user?.rol?.nombre === "Administrador"

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
    const normalizedSearch = normalizeText(searchTerm)

    const visibleServices = services.filter((service) => {
      if (!isAdministrator && !service.activo) {
        return false
      }

      const specialtyName =
        specialtiesById[service.especialidadId] ?? ""

      const searchableText = normalizeText(
        `${service.nombre} ${service.descripcion} ${specialtyName}`
      )

      if (
        normalizedSearch &&
        !searchableText.includes(normalizedSearch)
      ) {
        return false
      }

      if (
        specialtyFilter !== "todas" &&
        String(service.especialidadId) !== specialtyFilter
      ) {
        return false
      }

      const price = Number(service.precioBase)
      const duration = Number(service.duracionMinutos)

      if (
        minimumPrice !== "" &&
        price < Number(minimumPrice)
      ) {
        return false
      }

      if (
        maximumPrice !== "" &&
        price > Number(maximumPrice)
      ) {
        return false
      }

      if (
        minimumDuration !== "" &&
        duration < Number(minimumDuration)
      ) {
        return false
      }

      if (
        maximumDuration !== "" &&
        duration > Number(maximumDuration)
      ) {
        return false
      }

      return true
    })

    return [...visibleServices].sort(
      (firstService, secondService) => {
        if (sortOrder === "nombre-desc") {
          return secondService.nombre.localeCompare(
            firstService.nombre
          )
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

        return firstService.nombre.localeCompare(
          secondService.nombre
        )
      }
    )
  }, [
    services,
    specialtiesById,
    sortOrder,
    isAdministrator,
    searchTerm,
    specialtyFilter,
    minimumPrice,
    maximumPrice,
    minimumDuration,
    maximumDuration,
  ])

  const hasActiveFilters =
  searchTerm !== "" ||
  specialtyFilter !== "todas" ||
  minimumPrice !== "" ||
  maximumPrice !== "" ||
  minimumDuration !== "" ||
  maximumDuration !== "" ||
  sortOrder !== "nombre-asc"

  function clearFilters() {
  setSearchTerm("")
  setSpecialtyFilter("todas")
  setMinimumPrice("")
  setMaximumPrice("")
  setMinimumDuration("")
  setMaximumDuration("")
  setSortOrder("nombre-asc")
}

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

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {isAdministrator && (
            <Button
              nativeButton={false}
              render={<Link to="/servicios/nuevo" />}
            >
              Crear servicio
            </Button>
          )}


        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="service-search"
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Buscar por nombre, descripción o especialidad..."
            aria-label="Buscar servicios"
            className="flex-1"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFiltersOpen((currentValue) => !currentValue)
            }
          >
            {filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
        </div>

        {filtersOpen && (
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="specialty-filter"
                    className="text-sm font-medium"
                  >
                    Especialidad
                  </label>

                  <Select
                    value={specialtyFilter}
                    onValueChange={setSpecialtyFilter}
                  >
                    <SelectTrigger id="specialty-filter">
                      <SelectValue>
                        {specialtyFilter === "todas"
                          ? "Todas las especialidades"
                          : specialtiesById[
                          Number(specialtyFilter)
                          ] ?? "Especialidad"}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="todas">
                        Todas las especialidades
                      </SelectItem>

                      {specialties.map((specialty) => (
                        <SelectItem
                          key={specialty.id}
                          value={String(specialty.id)}
                        >
                          {specialty.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="service-sorting"
                    className="text-sm font-medium"
                  >
                    Ordenar por
                  </label>

                  <Select
                    value={sortOrder}
                    onValueChange={setSortOrder}
                  >
                    <SelectTrigger id="service-sorting">
                      <SelectValue>
                        {{
                          "nombre-asc": "Nombre: A-Z",
                          "nombre-desc": "Nombre: Z-A",
                          "precio-asc": "Menor precio",
                          "precio-desc": "Mayor precio",
                        }[sortOrder]}
                      </SelectValue>
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

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label
                    htmlFor="minimum-price"
                    className="text-sm font-medium"
                  >
                    Precio mínimo
                  </label>

                  <Input
                    id="minimum-price"
                    type="number"
                    min="0"
                    value={minimumPrice}
                    onChange={(event) =>
                      setMinimumPrice(event.target.value)
                    }
                    placeholder="₡0"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="maximum-price"
                    className="text-sm font-medium"
                  >
                    Precio máximo
                  </label>

                  <Input
                    id="maximum-price"
                    type="number"
                    min="0"
                    value={maximumPrice}
                    onChange={(event) =>
                      setMaximumPrice(event.target.value)
                    }
                    placeholder="Sin límite"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="minimum-duration"
                    className="text-sm font-medium"
                  >
                    Duración mínima
                  </label>

                  <Input
                    id="minimum-duration"
                    type="number"
                    min="0"
                    value={minimumDuration}
                    onChange={(event) =>
                      setMinimumDuration(event.target.value)
                    }
                    placeholder="Minutos"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="maximum-duration"
                    className="text-sm font-medium"
                  >
                    Duración máxima
                  </label>

                  <Input
                    id="maximum-duration"
                    type="number"
                    min="0"
                    value={maximumDuration}
                    onChange={(event) =>
                      setMaximumDuration(event.target.value)
                    }
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p
                  className="text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  {`${sortedServices.length} servicio${sortedServices.length === 1 ? "" : "s"
                    } encontrado${sortedServices.length === 1 ? "" : "s"
                    }`}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  Limpiar filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
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