import { apiRequest } from "@/services/api"

export async function getRestrictions() {
  return apiRequest("/restricciones-horario", {
    method: "GET",
  })
}

export async function getRestrictionById(restrictionId) {
  return apiRequest(
    `/restricciones-horario/${restrictionId}`,
    {
      method: "GET",
    }
  )
}

export async function getRestrictionTypes() {
  return apiRequest("/tipos-restriccion-horario", {
    method: "GET",
  })
}

export async function createRestriction(restrictionData) {
  return apiRequest("/restricciones-horario", {
    method: "POST",
    body: JSON.stringify(restrictionData),
  })
}

export async function updateRestriction(
  restrictionId,
  restrictionData
) {
  return apiRequest(
    `/restricciones-horario/${restrictionId}`,
    {
      method: "PUT",
      body: JSON.stringify(restrictionData),
    }
  )
}

export async function changeRestrictionStatus(
  restrictionId,
  active
) {
  return apiRequest(
    `/restricciones-horario/${restrictionId}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({
        activo: active,
      }),
    }
  )
}