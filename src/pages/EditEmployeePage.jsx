import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
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
  getEmployeeById,
  getEmployees,
  getEmployeeUsers,
  updateEmployee,
} from "@/services/employeeService"
import {
  getServices,
  getSpecialties,
} from "@/services/serviceService"

async function requestFormData(employeeId) {
  const [
    employeeResponse,
    usersResponse,
    employeesResponse,
    specialtiesResponse,
    servicesResponse,
  ] = await Promise.all([
    getEmployeeById(employeeId),
    getEmployeeUsers(),
    getEmployees(),
    getSpecialties(),
    getServices(),
  ])

  const employee = employeeResponse.data
  const users = usersResponse.data || []
  const employees = employeesResponse.data || []

  const assignedUserIds = new Set(
    employees
      .filter((item) => item.id !== employee.id)
      .map((item) => item.usuarioId)
  )

  return {
    employee,
    users: users.filter(
      (user) =>
        user.id === employee.usuarioId ||
        !assignedUserIds.has(user.id)
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

export function EditEmployeePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState(null)
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

    requestFormData(id)
      .then((data) => {
        if (!isActive) {
          return
        }

        setEmployee(data.employee)
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
  }, [id])

  async function handleSubmit(employeeData) {
    setSubmitting(true)
    setServerError("")
    setApiErrors({})

    try {
      await updateEmployee(id, employeeData)

      navigate(`/empleados/${id}`, {
        replace: true,
      })
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
    navigate(`/empleados/${id}`)
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

  if (loadError || !employee) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-8 text-center">
          <p role="alert" className="text-destructive">
            {loadError || "No se encontró el empleado."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Editar empleado</CardTitle>

        <CardDescription>
          Modifica su información y reemplaza los servicios que puede atender.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <EmployeeForm
          mode="edit"
          initialData={employee}
          users={users}
          specialties={specialties}
          services={services}
          submitting={submitting}
          serverError={serverError}
          apiErrors={apiErrors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  )
}