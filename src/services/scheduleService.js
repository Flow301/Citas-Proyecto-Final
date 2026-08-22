import { apiRequest } from "@/services/api"

export async function getSchedules() {
  return apiRequest("/horarios-atencion", {
    method: "GET",
  })
}

export async function getWeekDays() {
  return apiRequest("/dias-semana", {
    method: "GET",
  })
}