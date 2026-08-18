import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  title,
  formData,
  clients,
  services,
  employees,
  additionalServices,
  calculations,
  endTime,
  agenda,
  errors,
  loadingEmployees,
  loadingAgenda,
  submitting,
  onFieldChange,
  onAdditionalChange,
  onSubmit,
}) {
  const appointments = agenda?.citas ?? []
  const restrictions = agenda?.restricciones ?? []

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

            <select
              id="clienteId"
              value={formData.clienteId}
              onChange={(event) =>
                onFieldChange(
                  "clienteId",
                  event.target.value
                )
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              aria-invalid={Boolean(errors.clienteId)}
            >
              <option value="">Selecciona un cliente</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {getFullName(client)}
                </option>
              ))}
            </select>

            <FieldError error={errors.clienteId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="servicioId">
              Servicio{" "}
              <span className="text-destructive">*</span>
            </Label>

            <select
              id="servicioId"
              value={formData.servicioId}
              onChange={(event) =>
                onFieldChange(
                  "servicioId",
                  event.target.value
                )
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              aria-invalid={Boolean(errors.servicioId)}
            >
              <option value="">Selecciona un servicio</option>

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.nombre}
                </option>
              ))}
            </select>

            <FieldError error={errors.servicioId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empleadoId">
              Empleado{" "}
              <span className="text-destructive">*</span>
            </Label>

            <select
              id="empleadoId"
              value={formData.empleadoId}
              onChange={(event) =>
                onFieldChange(
                  "empleadoId",
                  event.target.value
                )
              }
              disabled={
                !formData.servicioId || loadingEmployees
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-50"
              aria-invalid={Boolean(errors.empleadoId)}
            >
              <option value="">
                {loadingEmployees
                  ? "Cargando empleados..."
                  : "Selecciona un empleado"}
              </option>

              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {getFullName(employee.usuario)}
                </option>
              ))}
            </select>

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

            <Input
              id="horaInicio"
              type="time"
              value={formData.horaInicio}
              onChange={(event) =>
                onFieldChange(
                  "horaInicio",
                  event.target.value
                )
              }
              aria-invalid={Boolean(errors.horaInicio)}
            />

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
                    <input
                      type="checkbox"
                      checked={formData.adicionalIds.includes(
                        additionalId
                      )}
                      onChange={(event) =>
                        onAdditionalChange(
                          additionalId,
                          event.target.checked
                        )
                      }
                      className="mt-1 size-4"
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
                    {String(appointment.horaInicio).slice(
                      11,
                      16
                    )}{" "}
                    -{" "}
                    {String(appointment.horaFin).slice(
                      11,
                      16
                    )}
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

            <textarea
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
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Información adicional para la cita"
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