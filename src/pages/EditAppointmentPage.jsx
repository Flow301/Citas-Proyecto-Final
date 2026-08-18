import { useEffect, useMemo, useState } from "react"
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router"
import { AppointmentForm } from "@/components/appointments/AppointmentForm"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import {
  calculateAppointmentCosts,
  calculateEndTime,
} from "@/lib/appointmentCalculations"
import {
  getActiveAdditionalServices,
  getActiveEmployeesForService,
  getActiveServicesForAppointments,
  getAppointmentById,
  getAppointmentEmployeeAgenda,
  getClients,
  getEmployeeAppointments,
  updateAppointment,
} from "@/services/appointmentService"

const initialFormData = {
  clienteId: "",
  servicioId: "",
  empleadoId: "",
  fecha: "",
  horaInicio: "",
  adicionalIds: [],
  observaciones: "",
}

function getCurrentDate() {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")
  const day = String(currentDate.getDate()).padStart(
    2,
    "0"
  )

  return `${year}-${month}-${day}`
}

function formatTimeForInput(timeValue) {
  if (!timeValue) {
    return ""
  }

  if (String(timeValue).includes("T")) {
    return String(timeValue).slice(11, 16)
  }

  return String(timeValue).slice(0, 5)
}

async function requestEditableAppointment(
  user,
  appointmentId
) {
  const role = user.rol?.nombre

  if (role === "Administrador") {
    return getAppointmentById(appointmentId)
  }

  if (role === "Empleado" && user.empleado?.id) {
    const appointmentsResponse =
      await getEmployeeAppointments(user.empleado.id)

    const belongsToEmployee = (
      appointmentsResponse.data ?? []
    ).some(
      (appointment) =>
        String(appointment.id) ===
        String(appointmentId)
    )

    if (belongsToEmployee) {
      return getAppointmentById(appointmentId)
    }
  }

  const accessError = new Error(
    "No tienes permiso para editar esta cita."
  )
  accessError.status = 403
  throw accessError
}

export function EditAppointmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState(
    initialFormData
  )
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [employees, setEmployees] = useState([])
  const [additionalServices, setAdditionalServices] =
    useState([])
  const [agenda, setAgenda] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingEmployees, setLoadingEmployees] =
    useState(false)
  const [loadingAgenda, setLoadingAgenda] =
    useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [accessDenied, setAccessDenied] =
    useState(false)

  useEffect(() => {
    let isActive = true

    async function loadPage() {
      try {
        const appointmentResponse =
          await requestEditableAppointment(user, id)

        const appointment = appointmentResponse.data

        if (!appointment.estadoCita?.permiteEdicion) {
          throw new Error(
            "El estado actual no permite editar esta cita."
          )
        }

        const [
          clientsResponse,
          servicesResponse,
          additionalResponse,
          employeesResponse,
        ] = await Promise.all([
          getClients(),
          getActiveServicesForAppointments(),
          getActiveAdditionalServices(),
          getActiveEmployeesForService(
            appointment.servicioId
          ),
        ])

        if (!isActive) {
          return
        }

        setClients(
          (clientsResponse.data ?? []).filter(
            (client) => client.activo
          )
        )
        setServices(servicesResponse.data ?? [])
        setAdditionalServices(
          additionalResponse.data ?? []
        )
        setEmployees(employeesResponse.data ?? [])

        setFormData({
          clienteId: String(appointment.clienteId),
          servicioId: String(appointment.servicioId),
          empleadoId: String(appointment.empleadoId),
          fecha: String(appointment.fecha).slice(0, 10),
          horaInicio: formatTimeForInput(
            appointment.horaInicio
          ),
          adicionalIds: (
            appointment.adicionales ?? []
          ).map((additional) => String(additional.id)),
          observaciones:
            appointment.observaciones ?? "",
        })
      } catch (requestError) {
        if (!isActive) {
          return
        }

        if (requestError.status === 403) {
          setAccessDenied(true)
        } else {
          setErrors({
            form: requestError.message,
          })
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      isActive = false
    }
  }, [id, user])

  useEffect(() => {
    if (!formData.servicioId) {
      return undefined
    }

    let isActive = true

    getActiveEmployeesForService(formData.servicioId)
      .then((response) => {
        if (isActive) {
          setEmployees(response.data ?? [])
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setErrors((currentErrors) => ({
            ...currentErrors,
            empleadoId: requestError.message,
          }))
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadingEmployees(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [formData.servicioId])

  useEffect(() => {
    if (!formData.empleadoId || !formData.fecha) {
      return undefined
    }

    let isActive = true

    getAppointmentEmployeeAgenda(
      formData.empleadoId,
      formData.fecha
    )
      .then((response) => {
        if (isActive) {
          setAgenda(response.data)
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setErrors((currentErrors) => ({
            ...currentErrors,
            disponibilidad: requestError.message,
          }))
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadingAgenda(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [formData.empleadoId, formData.fecha])

  const selectedService = useMemo(
    () =>
      services.find(
        (service) =>
          String(service.id) ===
          String(formData.servicioId)
      ),
    [services, formData.servicioId]
  )

  const calculations = useMemo(
    () =>
      calculateAppointmentCosts(
        selectedService,
        additionalServices,
        formData.adicionalIds
      ),
    [
      selectedService,
      additionalServices,
      formData.adicionalIds,
    ]
  )

  const endTime = useMemo(
    () =>
      calculateEndTime(
        formData.horaInicio,
        calculations.durationMinutes
      ),
    [formData.horaInicio, calculations.durationMinutes]
  )

  function handleFieldChange(field, value) {
    setFormData((currentData) => {
      if (field === "servicioId") {
        setEmployees([])
        setAgenda(null)
        setLoadingEmployees(Boolean(value))

        return {
          ...currentData,
          servicioId: value,
          empleadoId: "",
        }
      }

      if (field === "empleadoId") {
        setAgenda(null)

        if (value && currentData.fecha) {
          setLoadingAgenda(true)
        }
      }

      if (field === "fecha") {
        setAgenda(null)

        if (value && currentData.empleadoId) {
          setLoadingAgenda(true)
        }
      }

      return {
        ...currentData,
        [field]: value,
      }
    })

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: "",
      disponibilidad: "",
      form: "",
    }))
  }

  function handleAdditionalChange(
    additionalId,
    checked
  ) {
    setFormData((currentData) => ({
      ...currentData,
      adicionalIds: checked
        ? [...currentData.adicionalIds, additionalId]
        : currentData.adicionalIds.filter(
          (id) => id !== additionalId
        ),
    }))
  }

  function validateForm() {
    const newErrors = {}

    if (!formData.clienteId) {
      newErrors.clienteId =
        "Selecciona un cliente."
    }

    if (!formData.servicioId) {
      newErrors.servicioId =
        "Selecciona un servicio."
    }

    if (!formData.empleadoId) {
      newErrors.empleadoId =
        "Selecciona un empleado."
    }

    if (!formData.fecha) {
      newErrors.fecha = "Selecciona una fecha."
    } else if (formData.fecha < getCurrentDate()) {
      newErrors.fecha =
        "La fecha no puede estar en el pasado."
    }

    if (!formData.horaInicio) {
      newErrors.horaInicio =
        "Selecciona la hora de inicio."
    }

    if (!endTime) {
      newErrors.horaFin =
        "No se pudo calcular una hora final válida."
    }

    const observations = formData.observaciones.trim()

    if (
      observations &&
      observations.length < 3
    ) {
      newErrors.observaciones =
        "Las observaciones deben tener al menos 3 caracteres."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setErrors({})

    try {
      const response = await updateAppointment(id, {
        clienteId: Number(formData.clienteId),
        empleadoId: Number(formData.empleadoId),
        servicioId: Number(formData.servicioId),
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        horaFin: endTime,
        duracionMinutos:
          calculations.durationMinutes,
        precioServicio: calculations.servicePrice,
        costoAdicionales:
          calculations.additionalCost,
        costoTotal: calculations.totalCost,
        observaciones:
          formData.observaciones.trim() || null,
        adicionalIds: formData.adicionalIds.map(Number),
      })

      const appointmentId = response.data?.id ?? id

      navigate(`/citas/${appointmentId}`, {
        replace: true,
      })
    } catch (requestError) {
      setErrors({
        form: requestError.message,
        disponibilidad: requestError.message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (accessDenied) {
    return <Navigate to="/citas" replace />
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Cargando información del formulario...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        variant="outline"
        render={<Link to="/citas" />}
      >
        Volver a citas
      </Button>

      <AppointmentForm
        title="Editar cita"
        formData={formData}
        clients={clients}
        services={services}
        employees={employees}
        additionalServices={additionalServices}
        calculations={calculations}
        endTime={endTime}
        agenda={agenda}
        errors={errors}
        loadingEmployees={loadingEmployees}
        loadingAgenda={loadingAgenda}
        submitting={submitting}
        onFieldChange={handleFieldChange}
        onAdditionalChange={handleAdditionalChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}