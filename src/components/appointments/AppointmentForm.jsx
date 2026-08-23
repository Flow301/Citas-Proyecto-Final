import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useMemo } from "react"
import { calculateAvailableTimeSlots } from "@/lib/appointmentCalculations"

const EMPTY_LIST = []

function formatPrice(price) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(Number(price))
}

function getFullName(user) {
  if (!user) {
    return "No disponible"
  }

  return [
    user.nombre,
    user.primerApellido,
    user.segundoApellido,
  ]
    .filter(Boolean)
    .join(" ")
}

function formatTime(timeValue) {
  if (!timeValue) {
    return "No disponible"
  }

  const value = String(timeValue)

  if (value.includes("T")) {
    return value.slice(11, 16)
  }

  return value.slice(0, 5)
}

function FieldError({ error }) {
  if (!error) {
    return null
  }

  return (
    <p role="alert" className="text-sm text-destructive">
      {error}
    </p>
  )
}

export function AppointmentForm({
  appointmentId,
  title,
  formData,
   minimumDate,
  clients,
  services,
  employees,
  additionalServices,
  calculations,
  endTime,
  agenda,
  dailyAgenda,
  errors,
  loadingEmployees,
  loadingAgenda,
  submitting,
  onFieldChange,
  onAdditionalChange,
  onSubmit,
}) {
  const appointments = agenda?.citas ?? EMPTY_LIST
  const restrictions = agenda?.restricciones ?? EMPTY_LIST
  const schedules = dailyAgenda?.horarios ?? EMPTY_LIST
  const generalRestrictions =
    dailyAgenda?.restriccionesGenerales ?? EMPTY_LIST

  const availableTimeSlots = useMemo(
    () =>
      calculateAvailableTimeSlots({
        schedules,
        appointments,
        generalRestrictions,
        employeeRestrictions: restrictions,
        durationMinutes: calculations.durationMinutes,
        excludedAppointmentId: appointmentId,
      }),
    [
      schedules,
      appointments,
      generalRestrictions,
      restrictions,
      calculations.durationMinutes,
      appointmentId,
    ]
  )

  const selectedClient = clients.find(
    (client) =>
      String(client.id) === String(formData.clienteId)
  )

  const selectedService = services.find(
    (service) =>
      String(service.id) === String(formData.servicioId)
  )

  const selectedEmployee = employees.find(
    (employee) =>
      String(employee.id) === String(formData.empleadoId)
  )

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clienteId">
              Cliente{" "}
              <span className="text-destructive">*</span>
            </Label>

            <Select
              value={formData.clienteId}
              onValueChange={(value) =>
                onFieldChange("clienteId", value)
              }
            >
              <SelectTrigger
                id="clienteId"
                className="w-full"
                aria-invalid={Boolean(errors.clienteId)}
              >
                <SelectValue>
                  {selectedClient
                    ? getFullName(selectedClient)
                    : "Selecciona un cliente"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {clients.map((client) => (
                  <SelectItem
                    key={client.id}
                    value={String(client.id)}
                  >
                    {getFullName(client)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldError error={errors.clienteId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="servicioId">
              Servicio{" "}
              <span className="text-destructive">*</span>
            </Label>

            <Select
              value={formData.servicioId}
              onValueChange={(value) =>
                onFieldChange("servicioId", value)
              }
            >
              <SelectTrigger
                id="servicioId"
                className="w-full"
                aria-invalid={Boolean(errors.servicioId)}
              >
                <SelectValue>
                  {selectedService?.nombre ||
                    "Selecciona un servicio"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {services.map((service) => (
                  <SelectItem
                    key={service.id}
                    value={String(service.id)}
                  >
                    {service.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldError error={errors.servicioId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empleadoId">
              Empleado{" "}
              <span className="text-destructive">*</span>
            </Label>

            <Select
              value={formData.empleadoId}
              onValueChange={(value) =>
                onFieldChange("empleadoId", value)
              }
              disabled={
                !formData.servicioId || loadingEmployees
              }
            >
              <SelectTrigger
                id="empleadoId"
                className="w-full"
                aria-invalid={Boolean(errors.empleadoId)}
              >
                <SelectValue>
                  {loadingEmployees
                    ? "Cargando empleados..."
                    : selectedEmployee
                      ? getFullName(selectedEmployee.usuario)
                      : "Selecciona un empleado"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem
                    key={employee.id}
                    value={String(employee.id)}
                  >
                    {getFullName(employee.usuario)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldError error={errors.empleadoId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">
              Fecha{" "}
              <span className="text-destructive">*</span>
            </Label>

            <Input
              id="fecha"
              type="date"
              min={minimumDate}
              value={formData.fecha}
              onChange={(event) =>
                onFieldChange("fecha", event.target.value)
              }
              aria-invalid={Boolean(errors.fecha)}
            />

            <FieldError error={errors.fecha} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horaInicio">
              Hora de inicio{" "}
              <span className="text-destructive">*</span>
            </Label>

            <Select
              value={formData.horaInicio}
              onValueChange={(value) =>
                onFieldChange("horaInicio", value)
              }
              disabled={
                !formData.servicioId ||
                !formData.empleadoId ||
                !formData.fecha ||
                loadingAgenda ||
                availableTimeSlots.length === 0
              }
            >
              <SelectTrigger
                id="horaInicio"
                className="w-full"
                aria-invalid={Boolean(errors.horaInicio)}
              >
                <SelectValue>
                  {loadingAgenda
                    ? "Calculando horarios..."
                    : formData.horaInicio
                      ? formData.horaInicio
                      : availableTimeSlots.length === 0
                        ? "No hay horarios disponibles"
                        : "Selecciona una hora"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {availableTimeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldError error={errors.horaInicio} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horaFin">
              Hora de finalización
            </Label>

            <Input
              id="horaFin"
              value={endTime || "Selecciona una hora"}
              readOnly
            />

            <FieldError error={errors.horaFin} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Servicios adicionales</CardTitle>
        </CardHeader>

        <CardContent>
          {additionalServices.length === 0 ? (
            <p className="text-muted-foreground">
              No hay servicios adicionales disponibles.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {additionalServices.map((additional) => {
                const additionalId = String(
                  additional.id
                )

                return (
                  <label
                    key={additional.id}
                    className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
                  >
                    <Checkbox
                      checked={formData.adicionalIds.includes(
                        additionalId
                      )}
                      onCheckedChange={(checked) =>
                        onAdditionalChange(
                          additionalId,
                          checked === true
                        )
                      }
                      className="mt-1"
                    />

                    <span className="flex-1">
                      <span className="block font-medium">
                        {additional.nombre}
                      </span>

                      <span className="block text-sm text-muted-foreground">
                        {additional.descripcion}
                      </span>

                      <span className="block text-sm font-semibold">
                        {formatPrice(additional.precio)}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agenda del empleado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!formData.empleadoId || !formData.fecha ? (
            <p className="text-muted-foreground">
              Selecciona un empleado y una fecha para consultar
              su agenda.
            </p>
          ) : loadingAgenda ? (
            <p className="text-muted-foreground">
              Cargando agenda...
            </p>
          ) : (
            <>
              <div>
                <p className="font-medium">
                  Horario general del establecimiento
                </p>

                {schedules.length === 0 ? (
                  <p className="text-sm text-destructive">
                    El establecimiento no atiende en esta fecha.
                  </p>
                ) : (
                  schedules.map((schedule) => (
                    <p
                      key={schedule.id}
                      className="text-sm text-muted-foreground"
                    >
                      {String(schedule.horaInicio).slice(0, 5)} -{" "}
                      {String(schedule.horaFin).slice(0, 5)}
                    </p>
                  ))
                )}
              </div>

              {generalRestrictions.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">
                    Restricciones generales
                  </p>

                  {generalRestrictions.map((restriction) => (
                    <div
                      key={restriction.id}
                      className="rounded-md border border-red-200 bg-red-50 p-3"
                    >
                      <p className="text-sm text-red-700">
                        {restriction.todoElDia
                          ? "Todo el día"
                          : `${formatTime(
                            restriction.horaInicio
                          )} - ${formatTime(restriction.horaFin)}`}
                      </p>

                      <p className="text-sm text-red-700">
                        {restriction.motivo}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <p>
                Citas asignadas:{" "}
                <strong>{appointments.length}</strong>
              </p>

              <p>
                Restricciones activas:{" "}
                <strong>{restrictions.length}</strong>
              </p>

              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-md border p-3"
                >
                  <p className="font-medium">
                    {appointment.servicio?.nombre}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {formatTime(appointment.horaInicio)} -{" "}
                    {formatTime(appointment.horaFin)}
                  </p>
                </div>
              ))}

              {restrictions.map((restriction) => (
                <div
                  key={restriction.id}
                  className="rounded-md border border-red-200 bg-red-50 p-3"
                >
                  <p className="font-medium text-red-800">
                    Restricción
                  </p>

                  <p className="text-sm text-red-700">
                    {restriction.motivo}
                  </p>
                </div>
              ))}
            </>
          )}

          <FieldError error={errors.disponibilidad} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de la cita</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm text-muted-foreground">
                Duración
              </dt>

              <dd className="font-semibold">
                {calculations.durationMinutes} minutos
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Servicio
              </dt>

              <dd className="font-semibold">
                {formatPrice(calculations.servicePrice)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Adicionales
              </dt>

              <dd className="font-semibold">
                {formatPrice(calculations.additionalCost)}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">
                Total
              </dt>

              <dd className="font-semibold">
                {formatPrice(calculations.totalCost)}
              </dd>
            </div>
          </dl>

          <div className="space-y-2">
            <Label htmlFor="observaciones">
              Observaciones
            </Label>

            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(event) =>
                onFieldChange(
                  "observaciones",
                  event.target.value
                )
              }
              maxLength={500}
              rows={4}
              placeholder="Información adicional para la cita"
              aria-invalid={Boolean(errors.observaciones)}
            />

            <div className="flex justify-between gap-4">
              <FieldError
                error={errors.observaciones}
              />

              <span className="text-sm text-muted-foreground">
                {formData.observaciones.length}/500
              </span>
            </div>
          </div>

          {errors.form && (
            <p role="alert" className="text-destructive">
              {errors.form}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Guardando..."
              : "Guardar cita"}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}