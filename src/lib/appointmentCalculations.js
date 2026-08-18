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