export function calculateEndTime(
  startTime,
  durationMinutes
) {
  if (!startTime || !durationMinutes) {
    return ""
  }

  const [hours, minutes] = startTime
    .split(":")
    .map(Number)

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes)
  ) {
    return ""
  }

  const startMinutes = hours * 60 + minutes
  const endMinutes =
    startMinutes + Number(durationMinutes)

  if (endMinutes >= 24 * 60) {
    return ""
  }

  const endHours = Math.floor(endMinutes / 60)
  const remainingMinutes = endMinutes % 60

  return `${String(endHours).padStart(
    2,
    "0"
  )}:${String(remainingMinutes).padStart(2, "0")}`
}

export function calculateAppointmentCosts(
  service,
  additionalServices,
  selectedAdditionalIds
) {
  const servicePrice = Number(service?.precioBase ?? 0)

  const selectedAdditionalServices =
    additionalServices.filter((additional) =>
      selectedAdditionalIds.includes(
        String(additional.id)
      )
    )

  const additionalCost =
    selectedAdditionalServices.reduce(
      (total, additional) =>
        total + Number(additional.precio ?? 0),
      0
    )

  return {
    servicePrice,
    additionalCost,
    totalCost: servicePrice + additionalCost,
    durationMinutes: Number(
      service?.duracionMinutos ?? 0
    ),
    selectedAdditionalServices,
  }
}
function timeToMinutes(timeValue) {
  if (!timeValue) {
    return null
  }

  const value = String(timeValue)
  const time = value.includes("T")
    ? value.slice(11, 16)
    : value.slice(0, 5)

  const [hours, minutes] = time.split(":").map(Number)

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes)
  ) {
    return null
  }

  return hours * 60 + minutes
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`
}

function intervalsOverlap(
  firstStart,
  firstEnd,
  secondStart,
  secondEnd
) {
  return (
    firstStart < secondEnd &&
    firstEnd > secondStart
  )
}

export function calculateAvailableTimeSlots({
  schedules,
  appointments,
  generalRestrictions,
  employeeRestrictions,
  durationMinutes,
  excludedAppointmentId = null,
}) {
  const duration = Number(durationMinutes)

  if (!duration || duration <= 0) {
    return []
  }

  const restrictions = [
    ...(generalRestrictions ?? []),
    ...(employeeRestrictions ?? []),
  ].filter((restriction) => restriction.activo !== false)

  if (
    restrictions.some(
      (restriction) => restriction.todoElDia
    )
  ) {
    return []
  }

  const blockedIntervals = [
    ...(appointments ?? [])
      .filter(
        (appointment) =>
          String(appointment.id) !==
            String(excludedAppointmentId) &&
          appointment.estadoCita
            ?.bloqueaDisponibilidad !== false
      )
      .map((appointment) => ({
        start: timeToMinutes(appointment.horaInicio),
        end: timeToMinutes(appointment.horaFin),
      })),
    ...restrictions.map((restriction) => ({
      start: timeToMinutes(restriction.horaInicio),
      end: timeToMinutes(restriction.horaFin),
    })),
  ].filter(
    (interval) =>
      interval.start !== null &&
      interval.end !== null
  )

  const slots = []

  for (const schedule of schedules ?? []) {
    if (schedule.activo === false) {
      continue
    }

    const scheduleStart = timeToMinutes(
      schedule.horaInicio
    )
    const scheduleEnd = timeToMinutes(schedule.horaFin)

    if (
      scheduleStart === null ||
      scheduleEnd === null
    ) {
      continue
    }

    for (
      let start = scheduleStart;
      start + duration <= scheduleEnd;
      start += 10
    ) {
      const end = start + duration

      const isBlocked = blockedIntervals.some(
        (interval) =>
          intervalsOverlap(
            start,
            end,
            interval.start,
            interval.end
          )
      )

      if (!isBlocked) {
        slots.push(minutesToTime(start))
      }
    }
  }

  return [...new Set(slots)].sort()
}