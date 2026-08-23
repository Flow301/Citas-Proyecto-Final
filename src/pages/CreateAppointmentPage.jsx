import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
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
  checkAppointmentAvailability,
  createAppointment,
  getActiveAdditionalServices,
  getActiveAppointmentStatuses,
  getActiveEmployeesForService,
  getActiveServicesForAppointments,
  getAppointmentEmployeeAgenda,
  getClients,
  getDailyAppointmentAgenda,
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

function getMinimumAppointmentDate() {
  const minimumDate = new Date()

  minimumDate.setDate(minimumDate.getDate() + 1)

  const year = minimumDate.getFullYear()
  const month = String(
    minimumDate.getMonth() + 1
  ).padStart(2, "0")
  const day = String(
    minimumDate.getDate()
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const MINIMUM_APPOINTMENT_DATE =
  getMinimumAppointmentDate()

export function CreateAppointmentPage() {
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
  const [pendingStatusId, setPendingStatusId] =
    useState(null)
  const [agenda, setAgenda] = useState(null)
  const [dailyAgenda, setDailyAgenda] =
    useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingEmployees, setLoadingEmployees] =
    useState(false)
  const [loadingAgenda, setLoadingAgenda] =
    useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isActive = true

    Promise.all([
      getClients(),
      getActiveServicesForAppointments(),
      getActiveAdditionalServices(),
      getActiveAppointmentStatuses(),
    ])
      .then(
        ([
          clientsResponse,
          servicesResponse,
          additionalResponse,
          statusesResponse,
        ]) => {
          if (!isActive) {
            return
          }

          const statuses = statusesResponse.data ?? []
          const pendingStatus = statuses.find(
            (status) =>
              status.nombre.toLowerCase() === "pendiente"
          )

          setClients(
            (clientsResponse.data ?? []).filter(
              (client) => client.activo
            )
          )
          setServices(servicesResponse.data ?? [])
          setAdditionalServices(
            additionalResponse.data ?? []
          )
          setPendingStatusId(pendingStatus?.id ?? null)
        }
      )
      .catch((requestError) => {
        if (isActive) {
          setErrors({
            form: requestError.message,
          })
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

    Promise.all([
      getAppointmentEmployeeAgenda(
        formData.empleadoId,
        formData.fecha
      ),
      getDailyAppointmentAgenda(formData.fecha),
    ])
      .then(
        ([
          employeeAgendaResponse,
          dailyAgendaResponse,
        ]) => {
          if (isActive) {
            setAgenda(employeeAgendaResponse.data)
            setDailyAgenda(dailyAgendaResponse.data)
          }
        }
      )
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
    if (field === "servicioId") {
      setEmployees([])
      setAgenda(null)
      setDailyAgenda(null)
      setLoadingEmployees(Boolean(value))

      setFormData((currentData) => ({
        ...currentData,
        servicioId: value,
        empleadoId: "",
      }))
    } else {
      if (field === "empleadoId") {
        setAgenda(null)
        setDailyAgenda(null)

        if (value && formData.fecha) {
          setLoadingAgenda(true)
        }
      }

      if (field === "fecha") {
        setAgenda(null)
        setDailyAgenda(null)

        if (value && formData.empleadoId) {
          setLoadingAgenda(true)
        }
      }

      setFormData((currentData) => ({
        ...currentData,
        [field]: value,
      }))
    }

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
    } else if (
      formData.fecha < MINIMUM_APPOINTMENT_DATE) {
      newErrors.fecha =
        "La fecha debe ser posterior al día de hoy."
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

    if (!pendingStatusId) {
      newErrors.form =
        "No se encontró el estado Pendiente."
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

    const availabilityData = {
      empleadoId: Number(formData.empleadoId),
      servicioId: Number(formData.servicioId),
      fecha: formData.fecha,
      horaInicio: formData.horaInicio,
      horaFin: endTime,
    }

    try {
      const availabilityResponse =
        await checkAppointmentAvailability(
          availabilityData
        )

      const availability =
        availabilityResponse.data ??
        availabilityResponse

      if (availability.disponible === false) {
        throw new Error(
          availability.message ||
          "El horario seleccionado no está disponible."
        )
      }

      const response = await createAppointment({
        clienteId: Number(formData.clienteId),
        empleadoId: Number(formData.empleadoId),
        servicioId: Number(formData.servicioId),
        estadoCitaId: Number(pendingStatusId),
        creadoPorUsuarioId: Number(user.id),
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

      const appointmentId = response.data?.id

      navigate(
        appointmentId
          ? `/citas/${appointmentId}?resultado=creada`
          : "/citas",
        {
          replace: true,
        }
      )
    } catch (requestError) {
      setErrors({
        form: requestError.message,
        disponibilidad: requestError.message,
      })
    } finally {
      setSubmitting(false)
    }
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
        title="Registrar nueva cita"
        formData={formData}
        minimumDate={MINIMUM_APPOINTMENT_DATE}
        clients={clients}
        services={services}
        employees={employees}
        additionalServices={additionalServices}
        calculations={calculations}
        endTime={endTime}
        agenda={agenda}
        dailyAgenda={dailyAgenda}
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