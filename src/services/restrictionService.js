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