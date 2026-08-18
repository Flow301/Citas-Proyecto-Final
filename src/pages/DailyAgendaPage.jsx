import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDailyAppointmentAgenda } from "@/services/appointmentService"

function getCurrentDate() {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")
    const day = String(currentDate.getDate()).padStart(
        2,
        "0"
    )

    return `${year}-${month}-${day}`
}

function formatTime(timeValue) {
    if (!timeValue) {
        return "No disponible"
    }

    if (String(timeValue).includes("T")) {
        return String(timeValue).slice(11, 16)
    }

    return String(timeValue).slice(0, 5)
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

function getStatusClass(statusName) {
    const classes = {
        Pendiente:
            "border-yellow-200 bg-yellow-100 text-yellow-800",
        Confirmada:
            "border-blue-200 bg-blue-100 text-blue-800",
        Finalizada:
            "border-green-200 bg-green-100 text-green-800",
        Cancelada:
            "border-red-200 bg-red-100 text-red-800",
    }

    return (
        classes[statusName] ??
        "border-muted bg-muted text-muted-foreground"
    )
}

export function DailyAgendaPage() {
    const [date, setDate] = useState(getCurrentDate)
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let isActive = true

        getDailyAppointmentAgenda(date)
            .then((response) => {
                if (!isActive) {
                    return
                }

                const responseData = response.data

                const dailyAppointments = (
                    responseData?.empleados ?? []
                ).flatMap((employee) =>
                    (employee.citas ?? []).map((appointment) => ({
                        ...appointment,
                        empleado: appointment.empleado ?? employee,
                    }))
                )

                setAppointments(dailyAppointments)

            })
            .catch((requestError) => {
                if (isActive) {
                    setError(requestError.message)
                }
            })
            .finally(() => {
                if (isActive) {
                    setLoading(false)
                }
            })

        return () => {
            isActive = false
        }
    }, [date])

    const orderedAppointments = useMemo(() => {
        return [...appointments].sort((first, second) =>
            String(first.horaInicio).localeCompare(
                String(second.horaInicio)
            )
        )
    }, [appointments])

    function handleDateChange(event) {
        setDate(event.target.value)
        setAppointments([])
        setError("")
        setLoading(true)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Agenda diaria del establecimiento
                </h1>

                <p className="text-muted-foreground">
                    Consulta todas las citas programadas para una fecha.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar fecha</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="max-w-xs space-y-2">
                        <Label htmlFor="daily-agenda-date">
                            Fecha
                        </Label>

                        <Input
                            id="daily-agenda-date"
                            type="date"
                            value={date}
                            onChange={handleDateChange}
                        />
                    </div>
                </CardContent>
            </Card>

            {loading && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                            Cargando agenda diaria...
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

            {!loading && !error && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Citas del día ({orderedAppointments.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {orderedAppointments.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="font-medium">
                                    No hay citas para esta fecha.
                                </p>

                                <p className="text-muted-foreground">
                                    Selecciona otra fecha para consultar la
                                    agenda.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orderedAppointments.map(
                                    (appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="rounded-lg border p-4"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-lg font-semibold">
                                                        {formatTime(
                                                            appointment.horaInicio
                                                        )}{" "}
                                                        -{" "}
                                                        {formatTime(
                                                            appointment.horaFin
                                                        )}
                                                    </p>

                                                    <p className="text-muted-foreground">
                                                        {appointment.servicio?.nombre ??
                                                            "Servicio no disponible"}
                                                    </p>
                                                </div>

                                                <Badge
                                                    variant="outline"
                                                    className={getStatusClass(
                                                        appointment.estadoCita?.nombre
                                                    )}
                                                >
                                                    {appointment.estadoCita?.nombre ??
                                                        "Estado no disponible"}
                                                </Badge>
                                            </div>

                                            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <dt className="text-sm text-muted-foreground">
                                                        Cliente
                                                    </dt>

                                                    <dd className="font-medium">
                                                        {getFullName(
                                                            appointment.cliente
                                                        )}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-sm text-muted-foreground">
                                                        Empleado
                                                    </dt>

                                                    <dd className="font-medium">
                                                        {getFullName(
                                                            appointment.empleado?.usuario
                                                        )}
                                                    </dd>
                                                </div>
                                            </dl>

                                            <Button
                                                nativeButton={false}
                                                variant="outline"
                                                className="mt-4"
                                                render={
                                                    <Link
                                                        to={`/citas/${appointment.id}`}
                                                    />
                                                }
                                            >
                                                Ver detalle
                                            </Button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}