import { useEffect, useMemo, useState } from "react"
import { AdditionalServiceCard } from "@/components/additionals/AdditionalServiceCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function AdditionalServicesPage() {
  const { user } = useAuth()
  const isAdministrator = user?.rol?.nombre === "Administrador"
  const [additionals, setAdditionals] = useState([])
  const [sortOrder, setSortOrder] = useState("nombre-asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [minimumPrice, setMinimumPrice] = useState("")
  const [maximumPrice, setMaximumPrice] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
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
    const normalizedSearch = normalizeText(searchTerm)

    const visibleAdditionals = additionals.filter(
      (additional) => {
        if (!isAdministrator && !additional.activo) {
          return false
        }

        const searchableText = normalizeText(
          `${additional.nombre} ${additional.descripcion}`
        )

        if (
          normalizedSearch &&
          !searchableText.includes(normalizedSearch)
        ) {
          return false
        }

        const price = Number(additional.precio)

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

        return true
      }
    )

    return [...visibleAdditionals].sort(
      (firstAdditional, secondAdditional) => {
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
      }
    )
  }, [
    additionals,
    sortOrder,
    isAdministrator,
    searchTerm,
    minimumPrice,
    maximumPrice,
  ])

  const hasActiveFilters =
    searchTerm !== "" ||
    minimumPrice !== "" ||
    maximumPrice !== "" ||
    sortOrder !== "nombre-asc"

  function clearFilters() {
    setSearchTerm("")
    setMinimumPrice("")
    setMaximumPrice("")
    setSortOrder("nombre-asc")
  }

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
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="additional-search"
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Buscar por nombre o descripción..."
            aria-label="Buscar servicios adicionales"
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
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label
                    htmlFor="additional-sorting"
                    className="text-sm font-medium"
                  >
                    Ordenar por
                  </label>

                  <Select
                    value={sortOrder}
                    onValueChange={setSortOrder}
                  >
                    <SelectTrigger id="additional-sorting">
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

                <div className="space-y-2">
                  <label
                    htmlFor="additional-minimum-price"
                    className="text-sm font-medium"
                  >
                    Precio mínimo
                  </label>

                  <Input
                    id="additional-minimum-price"
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
                    htmlFor="additional-maximum-price"
                    className="text-sm font-medium"
                  >
                    Precio máximo
                  </label>

                  <Input
                    id="additional-maximum-price"
                    type="number"
                    min="0"
                    value={maximumPrice}
                    onChange={(event) =>
                      setMaximumPrice(event.target.value)
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
                  {`${sortedAdditionals.length} adicional${sortedAdditionals.length === 1 ? "" : "es"
                    } encontrado${sortedAdditionals.length === 1 ? "" : "s"
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