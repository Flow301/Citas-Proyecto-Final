import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getEmployeeAgenda } from "@/services/employeeService"
import { useAuth } from "@/context/auth-context"

function formatPrice(price) {
    return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
    }).format(Number(price))
}

function formatTime(timeValue) {
    if (!timeValue) {
        return "No disponible"
    }

    return timeValue.slice(11, 16)
}

function getCurrentDate() {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(
        2,
        "0"
    )
    const day = String(currentDate.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

function getEmployeeName(employee) {
    const user = employee?.usuario

    if (!user) {
        return "Empleado"
    }

    return [
        user.nombre,
        user.primerApellido,
        user.segundoApellido,
    ]
        .filter(Boolean)
        .join(" ")
}

export function EmployeeAgendaPage() {
    const { id } = useParams()
    const { user } = useAuth()

    const isAdministrator =
        user.rol?.nombre === "Administrador"

    const isOwnAgenda =
        user.rol?.nombre === "Empleado" &&
        String(user.empleado?.id) === String(id)

    const canViewAgenda = isAdministrator || isOwnAgenda
    const [date, setDate] = useState(getCurrentDate)
    const [agenda, setAgenda] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!canViewAgenda) {
            return undefined
        }
        let isActive = true

        async function loadAgenda() {
            setLoading(true)
            setError("")

            try {
                const response = await getEmployeeAgenda(id, date)

                if (isActive) {
                    setAgenda(response.data)
                }
            } catch (requestError) {
                if (isActive) {
                    setError(requestError.message)
                    setAgenda(null)
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        loadAgenda()

        return () => {
            isActive = false
        }
    }, [id, date, canViewAgenda])

    const appointments = agenda?.citas ?? []
    const restrictions = agenda?.restricciones ?? []
    if (!canViewAgenda) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="space-y-6">
            <Button
                nativeButton={false}
                variant="outline"
                render={
                    <Link
                        to={
                            isAdministrator
                                ? `/empleados/${id}`
                                : "/"
                        }
                    />
                }
            >
                Volver al empleado
            </Button>

            <div>
                <h1 className="text-3xl font-bold">
                    Agenda de {getEmployeeName(agenda)}
                </h1>

                {agenda && (
                    <p className="text-muted-foreground">
                        Código: {agenda.codigoEmpleado} · Especialidad:{" "}
                        {agenda.especialidad?.nombre}
                    </p>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar fecha</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="max-w-xs space-y-2">
                        <Label htmlFor="agenda-date">Fecha</Label>

                        <Input
                            id="agenda-date"
                            type="date"
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {loading && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                            Cargando agenda...
                        </p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p role="alert" className="text-destructive">
                            {error}
                        </p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && agenda && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Citas del día ({appointments.length})
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            {appointments.length === 0 ? (
                                <p className="text-muted-foreground">
                                    El empleado no tiene citas registradas para
                                    esta fecha.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {appointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="rounded-lg border p-4"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {appointment.servicio?.nombre}
                                                    </h3>

                                                    <p className="text-sm text-muted-foreground">
                                                        Cliente:{" "}
                                                        {[
                                                            appointment.cliente?.nombre,
                                                            appointment.cliente
                                                                ?.primerApellido,
                                                            appointment.cliente
                                                                ?.segundoApellido,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" ")}
                                                    </p>
                                                </div>

                                                <span className="rounded-full border px-3 py-1 text-sm">
                                                    {appointment.estadoCita?.nombre}
                                                </span>
                                            </div>

                                            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                                                <div>
                                                    <dt className="text-sm text-muted-foreground">
                                                        Horario
                                                    </dt>

                                                    <dd className="font-medium">
                                                        {formatTime(
                                                            appointment.horaInicio
                                                        )}{" "}
                                                        -{" "}
                                                        {formatTime(appointment.horaFin)}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm text-muted-foreground">
                                                        Duración
                                                    </dt>

                                                    <dd className="font-medium">
                                                        {appointment.duracionMinutos} minutos
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm text-muted-foreground">
                                                        Costo total
                                                    </dt>

                                                    <dd className="font-medium">
                                                        {formatPrice(
                                                            appointment.costoTotal
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>

                                            {appointment.observaciones && (
                                                <div className="mt-4">
                                                    <p className="text-sm text-muted-foreground">
                                                        Observaciones
                                                    </p>

                                                    <p>{appointment.observaciones}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Restricciones ({restrictions.length})
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            {restrictions.length === 0 ? (
                                <p className="text-muted-foreground">
                                    El empleado no tiene restricciones activas
                                    para esta fecha.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {restrictions.map((restriction) => (
                                        <div
                                            key={restriction.id}
                                            className="rounded-lg border p-4"
                                        >
                                            <p className="font-semibold">
                                                {restriction.todoElDia
                                                    ? "Restricción durante todo el día"
                                                    : `${formatTime(
                                                        restriction.horaInicio
                                                    )} - ${formatTime(
                                                        restriction.horaFin
                                                    )}`}
                                            </p>

                                            <p className="text-muted-foreground">
                                                {restriction.motivo ||
                                                    "Sin motivo especificado"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}