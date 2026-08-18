import { apiRequest, } from "@/services/api"

export async function getAppointments() {
  return apiRequest("/citas", {
    method: "GET",
  })
}

export async function getClientAppointments(clientId) {
  return apiRequest(`/citas/cliente/${clientId}`, {
    method: "GET",
  })
}

export async function getEmployeeAppointments(employeeId) {
  return apiRequest(`/citas/empleado/${employeeId}`, {
    method: "GET",
  })
}

export async function getAppointmentById(appointmentId) {
  return apiRequest(`/citas/${appointmentId}`, {
    method: "GET",
  })
}

export async function cancelAppointment(
  appointmentId,
  cancellationReason
) {
  return apiRequest(
    `/citas/${appointmentId}/cancelar`,
    {
      method: "PATCH",
      body: JSON.stringify({
        motivoCancelacion: cancellationReason,
      }),
    }
  )
}

export async function getActiveAppointmentStatuses() {
  return apiRequest("/estados-cita", {
    method: "GET",
  })
}

export async function changeAppointmentStatus(
  appointmentId,
  statusId
) {
  return apiRequest(`/citas/${appointmentId}/estado`, {
    method: "PATCH",
    body: JSON.stringify({
      estadoCitaId: Number(statusId),
    }),
  })
}

export async function createAppointment(appointmentData) {
  return apiRequest("/citas", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  })
}

export async function checkAppointmentAvailability(
  availabilityData
) {
  return apiRequest("/citas/disponibilidad", {
    method: "POST",
    body: JSON.stringify(availabilityData),
  })
}

export async function getClients() {
  return apiRequest("/usuarios?rol=Cliente", {
    method: "GET",
  })
}

export async function getActiveServicesForAppointments() {
  return apiRequest("/servicios/activos", {
    method: "GET",
  })
}

export async function getActiveAdditionalServices() {
  return apiRequest("/servicios-adicionales/activos", {
    method: "GET",
  })
}

export async function getActiveEmployeesForService(
  serviceId
) {
  const query = serviceId
    ? `?servicioId=${encodeURIComponent(serviceId)}`
    : ""

  return apiRequest(`/empleados/activos${query}`, {
    method: "GET",
  })
}

export async function getAppointmentEmployeeAgenda(
  employeeId,
  date
) {
  return apiRequest(
    `/citas/agenda-empleado/${employeeId}?fecha=${encodeURIComponent(
      date
    )}`,
    {
      method: "GET",
    }
  )
}

export async function updateAppointment(
  appointmentId,
  appointmentData
) {
  return apiRequest(`/citas/${appointmentId}`, {
    method: "PUT",
    body: JSON.stringify(appointmentData),
  })
}

export async function getDailyAppointmentAgenda(date) {
  return apiRequest(
    `/citas/agenda-diaria?fecha=${encodeURIComponent(
      date
    )}`,
    {
      method: "GET",
    }
  )
}