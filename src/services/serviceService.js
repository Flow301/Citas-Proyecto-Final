import { apiRequest } from "@/services/api"

const API_URL = import.meta.env.VITE_API_URL

export async function getServices() {
  return apiRequest("/servicios", {
    method: "GET",
  })
}

export async function getServiceById(serviceId) {
  return apiRequest(`/servicios/${serviceId}`, {
    method: "GET",
  })
}

export async function getSpecialties() {
  return apiRequest("/especialidades", {
    method: "GET",
  })
}

export function getServiceImageUrl(fileName) {
  if (!fileName) {
    return null
  }

  return `${API_URL}/images/download/${encodeURIComponent(fileName)}`
}