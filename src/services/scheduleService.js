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

export async function getScheduleById(scheduleId) {
  return apiRequest(
    `/horarios-atencion/${scheduleId}`,
    {
      method: "GET",
    }
  )
}

export async function createSchedule(scheduleData) {
  return apiRequest("/horarios-atencion", {
    method: "POST",
    body: JSON.stringify(scheduleData),
  })
}

export async function updateSchedule(
  scheduleId,
  scheduleData
) {
  return apiRequest(
    `/horarios-atencion/${scheduleId}`,
    {
      method: "PUT",
      body: JSON.stringify(scheduleData),
    }
  )
}

export async function changeScheduleStatus(
  scheduleId,
  active
) {
  return apiRequest(
    `/horarios-atencion/${scheduleId}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({
        activo: active,
      }),
    }
  )
}