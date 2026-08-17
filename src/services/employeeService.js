import { apiRequest } from "@/services/api"

export async function getEmployees() {
  return apiRequest("/empleados", {
    method: "GET",
  })
}

export async function getEmployeeUsers() {
  return apiRequest("/usuarios?rol=Empleado", {
    method: "GET",
  })
}

export async function getEmployeeById(employeeId) {
  return apiRequest(`/empleados/${employeeId}`, {
    method: "GET",
  })
}

export async function createEmployee(employeeData) {
  return apiRequest("/empleados", {
    method: "POST",
    body: JSON.stringify(employeeData),
  })
}

export async function updateEmployee(employeeId, employeeData) {
  return apiRequest(`/empleados/${employeeId}`, {
    method: "PUT",
    body: JSON.stringify(employeeData),
  })
}

export async function changeEmployeeStatus(employeeId, active) {
  return apiRequest(`/empleados/${employeeId}/estado`, {
    method: "PATCH",
    body: JSON.stringify({
      activo: active,
    }),
  })
}

export async function getEmployeeAgenda(employeeId, date) {
  const searchParams = new URLSearchParams({
    fecha: date,
  })

  return apiRequest(
    `/empleados/${employeeId}/agenda?${searchParams.toString()}`,
    {
      method: "GET",
    }
  )
}