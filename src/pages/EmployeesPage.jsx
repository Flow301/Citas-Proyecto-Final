import { useEffect, useMemo, useState } from "react"
import { EmployeeCard } from "@/components/employees/EmployeeCard"
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
import { getEmployees } from "@/services/employeeService"
import { getSpecialties } from "@/services/serviceService"
import { Link } from "react-router"
import { useAuth } from "@/context/auth-context"

async function requestEmployeesData() {
  const [employeesResponse, specialtiesResponse] =
    await Promise.all([
      getEmployees(),
      getSpecialties(),
    ])

  return {
    employees: employeesResponse.data || [],
    specialties: specialtiesResponse.data || [],
  }
}

function getEmployeeName(employee) {
  return [
    employee.usuario?.nombre,
    employee.usuario?.primerApellido,
    employee.usuario?.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
}

export function EmployeesPage() {
  const { user } = useAuth()
  const isAdministrator =
    user?.rol?.nombre === "Administrador"
  const [employees, setEmployees] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [sortOrder, setSortOrder] = useState("nombre-asc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  function loadEmployees() {
    setLoading(true)
    setError("")

    requestEmployeesData()
      .then((data) => {
        setEmployees(data.employees)
        setSpecialties(data.specialties)
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

    requestEmployeesData()
      .then((data) => {
        if (!isActive) {
          return
        }

        setEmployees(data.employees)
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

  const sortedEmployees = useMemo(() => {
    const visibleEmployees = isAdministrator
      ? employees
      : employees.filter((employee) => employee.activo)

    return [...visibleEmployees].sort(
      (firstEmployee, secondEmployee) => {
        const firstName = getEmployeeName(firstEmployee)
        const secondName = getEmployeeName(secondEmployee)

        if (sortOrder === "nombre-desc") {
          return secondName.localeCompare(firstName)
        }

        if (sortOrder === "codigo-asc") {
          return firstEmployee.codigoEmpleado.localeCompare(
            secondEmployee.codigoEmpleado
          )
        }

        if (sortOrder === "codigo-desc") {
          return secondEmployee.codigoEmpleado.localeCompare(
            firstEmployee.codigoEmpleado
          )
        }

        return firstName.localeCompare(secondName)
      }
    )
  }, [employees, sortOrder, isAdministrator])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Empleados
          </h1>

          <p className="text-muted-foreground">
            Consulta el personal y los servicios que puede atender.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {isAdministrator && (
            <Button
              nativeButton={false}
              render={<Link to="/empleados/nuevo" />}
            >
              Crear empleado
            </Button>
          )}

          <div className="w-full sm:w-56">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger aria-label="Ordenar empleados">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="nombre-asc">
                  Nombre: A-Z
                </SelectItem>

                <SelectItem value="nombre-desc">
                  Nombre: Z-A
                </SelectItem>

                <SelectItem value="codigo-asc">
                  Código: A-Z
                </SelectItem>

                <SelectItem value="codigo-desc">
                  Código: Z-A
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
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-1/4" />
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

            <Button type="button" onClick={loadEmployees}>
              Intentar nuevamente
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && sortedEmployees.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">
              No hay empleados registrados.
            </p>

            <p className="text-sm text-muted-foreground">
              Los empleados aparecerán aquí cuando sean registrados.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && sortedEmployees.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {sortedEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              specialtyName={
                specialtiesById[employee.especialidadId]
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}