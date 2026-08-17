import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { EmployeeForm } from "@/components/employees/EmployeeForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  createEmployee,
  getEmployees,
  getEmployeeUsers,
} from "@/services/employeeService"
import {
  getServices,
  getSpecialties,
} from "@/services/serviceService"

async function requestFormData() {
  const [
    usersResponse,
    employeesResponse,
    specialtiesResponse,
    servicesResponse,
  ] = await Promise.all([
    getEmployeeUsers(),
    getEmployees(),
    getSpecialties(),
    getServices(),
  ])

  const users = usersResponse.data || []
  const employees = employeesResponse.data || []

  const assignedUserIds = new Set(
    employees.map((employee) => employee.usuarioId)
  )

  return {
    users: users.filter(
      (user) => !assignedUserIds.has(user.id)
    ),
    specialties: specialtiesResponse.data || [],
    services: servicesResponse.data || [],
  }
}

function mapValidationErrors(validationErrors) {
  return Object.fromEntries(
    validationErrors.map((validationError) => [
      validationError.field,
      validationError.message,
    ])
  )
}

export function CreateEmployeePage() {
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState("")
  const [apiErrors, setApiErrors] = useState({})

  useEffect(() => {
    let isActive = true

    requestFormData()
      .then((data) => {
        if (!isActive) {
          return
        }

        setUsers(data.users)
        setSpecialties(data.specialties)
        setServices(data.services)
      })
      .catch((requestError) => {
        if (isActive) {
          setLoadError(requestError.message)
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

  async function handleSubmit(employeeData) {
    setSubmitting(true)
    setServerError("")
    setApiErrors({})

    try {
      await createEmployee(employeeData)
      navigate("/empleados", { replace: true })
    } catch (requestError) {
      if (requestError.validationErrors?.length > 0) {
        setApiErrors(
          mapValidationErrors(requestError.validationErrors)
        )
      } else {
        setServerError(requestError.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    navigate("/empleados")
  }

  if (loading) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-4/5" />
        </CardHeader>

        <CardContent className="space-y-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-8 text-center">
          <p role="alert" className="text-destructive">
            {loadError}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Crear empleado</CardTitle>

        <CardDescription>
          Asocia un usuario con su especialidad y los servicios que puede atender.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {users.length === 0 ? (
          <div className="space-y-2 rounded-md border p-6 text-center">
            <p className="font-medium">
              No hay usuarios disponibles.
            </p>

            <p className="text-sm text-muted-foreground">
              Todos los usuarios con rol Empleado ya están asociados con un perfil.
            </p>
          </div>
        ) : (
          <EmployeeForm
            mode="create"
            users={users}
            specialties={specialties}
            services={services}
            submitting={submitting}
            serverError={serverError}
            apiErrors={apiErrors}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </CardContent>
    </Card>
  )
}