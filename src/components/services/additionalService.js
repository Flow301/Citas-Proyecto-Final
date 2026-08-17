import { apiRequest } from "@/services/api"

export async function getAdditionalServices() {
  return apiRequest("/servicios-adicionales", {
    method: "GET",
  })
}

export async function getAdditionalServiceById(additionalId) {
  return apiRequest(`/servicios-adicionales/${additionalId}`, {
    method: "GET",
  })
}

export async function createAdditionalService(additionalData) {
  return apiRequest("/servicios-adicionales", {
    method: "POST",
    body: JSON.stringify(additionalData),
  })
}

export async function updateAdditionalService(
  additionalId,
  additionalData
) {
  return apiRequest(`/servicios-adicionales/${additionalId}`, {
    method: "PUT",
    body: JSON.stringify(additionalData),
  })
}

export async function changeAdditionalServiceStatus(
  additionalId,
  active
) {
  return apiRequest(
    `/servicios-adicionales/${additionalId}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({
        activo: active,
      }),
    }
  )
}