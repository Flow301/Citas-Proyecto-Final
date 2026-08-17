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

export async function createService(serviceData) {
  return apiRequest("/servicios", {
    method: "POST",
    body: JSON.stringify(serviceData),
  })
}

export async function updateService(serviceId, serviceData) {
  return apiRequest(`/servicios/${serviceId}`, {
    method: "PUT",
    body: JSON.stringify(serviceData),
  })
}

export async function changeServiceStatus(serviceId, active) {
  return apiRequest(`/servicios/${serviceId}/estado`, {
    method: "PATCH",
    body: JSON.stringify({
      activo: active,
    }),
  })
}

export async function uploadServiceImage(
  imageFile,
  previousFileName
) {
  const formData = new FormData()

  formData.append("image", imageFile)

  if (previousFileName) {
    formData.append("previousFileName", previousFileName)
  }

  return apiRequest("/images/upload", {
    method: "POST",
    body: formData,
  })
}

export function getServiceImageUrl(fileName) {
  if (!fileName) {
    return null
  }

  return `${API_URL}/images/download/${encodeURIComponent(fileName)}`
}
