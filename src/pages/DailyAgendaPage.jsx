import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
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
            "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
        Confirmada:
            "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
        "En proceso":
            "border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200",
        Finalizada:
            "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
        Cancelada:
            "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
    }

    return (
        classes[statusName] ??
        "border-muted bg-muted text-muted-foreground"
    )
}

function timeToMinutes(timeValue) {
    if (!timeValue) {
        return null
    }

    const formattedTime = formatTime(timeValue)

    if (formattedTime === "No disponible") {
        return null
    }

    const [hours, minutes] = formattedTime
        .split(":")
        .map(Number)

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
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

function addIntervalLimits(limits, interval) {
    const start = timeToMinutes(interval?.horaInicio)
    const end = timeToMinutes(interval?.horaFin)

    if (start !== null && end !== null && start < end) {
        limits.add(start)
        limits.add(end)
    }
}

function addHourlyScheduleLimits(limits, schedule) {
    const start = timeToMinutes(schedule?.horaInicio)
    const end = timeToMinutes(schedule?.horaFin)

    if (start === null || end === null || start >= end) {
        return
    }

    limits.add(start)
    limits.add(end)

    let nextLimit =
        Math.floor(start / 60) * 60 + 60

    while (nextLimit < end) {
        limits.add(nextLimit)
        nextLimit += 60
    }
}

function buildAgendaSegments(agendaData) {
    const limits = new Set()

    const schedules = agendaData?.horarios ?? []
    const employees = agendaData?.empleados ?? []
    const generalRestrictions =
        agendaData?.restriccionesGenerales ?? []

    schedules
        .filter((schedule) => schedule.activo !== false)
        .forEach((schedule) =>
            addHourlyScheduleLimits(limits, schedule)
        )

    generalRestrictions
        .filter(
            (restriction) =>
                restriction.activo !== false &&
                !restriction.todoElDia
        )
        .forEach((restriction) =>
            addIntervalLimits(limits, restriction)
        )

    employees.forEach((employee) => {
        ; (employee.citas ?? [])
            .filter(
                (appointment) =>
                    !isCancelledAppointment(appointment)
            )
            .forEach((appointment) =>
                addIntervalLimits(limits, appointment)
            )

            ; (employee.restricciones ?? [])
                .filter(
                    (restriction) =>
                        restriction.activo !== false &&
                        !restriction.todoElDia
                )
                .forEach((restriction) =>
                    addIntervalLimits(limits, restriction)
                )
    })

    const orderedLimits = [...limits].sort(
        (first, second) => first - second
    )

    return orderedLimits
        .slice(0, -1)
        .map((start, index) => ({
            start,
            end: orderedLimits[index + 1],
            label: `${minutesToTime(start)} - ${minutesToTime(
                orderedLimits[index + 1]
            )}`,
        }))
        .filter((segment) => segment.start < segment.end)
}

function restrictionAffectsSegment(
    restriction,
    segment
) {
    if (restriction.activo === false) {
        return false
    }

    if (restriction.todoElDia) {
        return true
    }

    const start = timeToMinutes(
        restriction.horaInicio
    )
    const end = timeToMinutes(restriction.horaFin)

    if (start === null || end === null) {
        return false
    }

    return intervalsOverlap(
        segment.start,
        segment.end,
        start,
        end
    )
}

function isCancelledAppointment(appointment) {
    return (
        appointment.estadoCita?.nombre
            ?.trim()
            .toLowerCase() === "cancelada"
    )
}

function appointmentAffectsSegment(
    appointment,
    segment
) {
    const start = timeToMinutes(
        appointment.horaInicio
    )
    const end = timeToMinutes(appointment.horaFin)

    if (start === null || end === null) {
        return false
    }

    return intervalsOverlap(
        segment.start,
        segment.end,
        start,
        end
    )
}

function scheduleContainsSegment(schedule, segment) {
    if (schedule.activo === false) {
        return false
    }

    const start = timeToMinutes(schedule.horaInicio)
    const end = timeToMinutes(schedule.horaFin)

    if (start === null || end === null) {
        return false
    }

    return (
        segment.start >= start &&
        segment.end <= end
    )
}

function getAgendaCell(agendaData, employee, segment) {
    const generalRestriction = (
        agendaData?.restriccionesGenerales ?? []
    ).find((restriction) =>
        restrictionAffectsSegment(
            restriction,
            segment
        )
    )

    if (generalRestriction) {
        return {
            type: "restriction",
            restriction: generalRestriction,
            label:
                generalRestriction.motivo ||
                "Restricción general",
        }
    }

    const employeeRestriction = (
        employee.restricciones ?? []
    ).find((restriction) =>
        restrictionAffectsSegment(
            restriction,
            segment
        )
    )

    if (employeeRestriction) {
        return {
            type: "restriction",
            restriction: employeeRestriction,
            label:
                employeeRestriction.motivo ||
                "Restricción del empleado",
        }
    }

    const appointment = (
        employee.citas ?? []
    ).find(
        (item) =>
            !isCancelledAppointment(item) &&
            appointmentAffectsSegment(item, segment)
    )

    if (appointment) {
        return {
            type: "appointment",
            appointment,
            label:
                appointment.servicio?.nombre ||
                "Cita programada",
        }
    }

    const isOpen = (
        agendaData?.horarios ?? []
    ).some((schedule) =>
        scheduleContainsSegment(schedule, segment)
    )

    if (isOpen) {
        return {
            type: "available",
            label: "Disponible",
        }
    }

    return {
        type: "closed",
        label: "Fuera de horario",
    }
}

function getAgendaCellClass(cellType) {
    const classes = {
        appointment:
            "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100",
        restriction:
            "border-red-200 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100",
        available:
            "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-100",
        closed:
            "border-muted bg-muted/50 text-muted-foreground",
    }

    return classes[cellType] ?? classes.closed
}

export function DailyAgendaPage() {
    const [date, setDate] = useState(getCurrentDate)
    const [agenda, setAgenda] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let isActive = true

        getDailyAppointmentAgenda(date)
            .then((response) => {
                if (!isActive) {
                    return
                }

                setAgenda(response.data)

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
        const dailyAppointments = (
            agenda?.empleados ?? []
        ).flatMap((employee) =>
            (employee.citas ?? [])
                .filter(
                    (appointment) =>
                        !isCancelledAppointment(appointment)
                )
                .map((appointment) => ({
                    ...appointment,
                    empleado:
                        appointment.empleado ?? employee,
                }))
        )

        return dailyAppointments.sort((first, second) =>
            String(first.horaInicio).localeCompare(
                String(second.horaInicio)
            )
        )
    }, [agenda])

    const employees = useMemo(
        () => agenda?.empleados ?? [],
        [agenda]
    )

    const agendaSegments = useMemo(
        () => buildAgendaSegments(agenda),
        [agenda]
    )

    function handleDateChange(event) {
        setDate(event.target.value)
        setAgenda(null)
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
                            Agenda del día (
                            {orderedAppointments.length} citas)
                        </CardTitle>

                        <div className="flex flex-wrap gap-3 text-sm">
                            <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-100">
                                Disponible
                            </span>

                            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-blue-950 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100">
                                Cita
                            </span>

                            <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-red-950 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100">
                                Restricción
                            </span>

                            <span className="rounded-md border bg-muted/50 px-2 py-1 text-muted-foreground">
                                Fuera de horario
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {employees.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="font-medium">
                                    No hay empleados activos.
                                </p>

                                <p className="text-muted-foreground">
                                    No es posible construir la agenda
                                    para esta fecha.
                                </p>
                            </div>
                        ) : agendaSegments.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="font-medium">
                                    No hay horario de atención para
                                    esta fecha.
                                </p>

                                <p className="text-muted-foreground">
                                    Selecciona otra fecha para
                                    consultar la agenda.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <div
                                    className="grid min-w-max gap-2"
                                    style={{
                                        gridTemplateColumns: `minmax(140px, 180px) repeat(${employees.length}, minmax(220px, 1fr))`,
                                    }}
                                >
                                    <div className="sticky left-0 z-10 rounded-md border bg-background p-3 font-semibold">
                                        Horario
                                    </div>

                                    {employees.map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="rounded-md border bg-background p-3 font-semibold"
                                        >
                                            {getFullName(
                                                employee.usuario
                                            )}
                                        </div>
                                    ))}

                                    {agendaSegments.map((segment) => (
                                        <div
                                            key={segment.label}
                                            className="contents"
                                        >
                                            <div className="sticky left-0 z-10 rounded-md border bg-background p-3 font-medium">
                                                {segment.label}
                                            </div>

                                            {employees.map(
                                                (employee) => {
                                                    const cell =
                                                        getAgendaCell(
                                                            agenda,
                                                            employee,
                                                            segment
                                                        )

                                                    return (
                                                        <div
                                                            key={`${employee.id}-${segment.label}`}
                                                            className={`min-h-24 rounded-md border p-3 ${getAgendaCellClass(
                                                                cell.type
                                                            )}`}
                                                        >
                                                            {cell.type ===
                                                                "appointment" ? (
                                                                <Link
                                                                    to={`/citas/${cell.appointment.id}`}
                                                                    className="block space-y-2"
                                                                >
                                                                    <p className="font-semibold">
                                                                        {
                                                                            cell
                                                                                .appointment
                                                                                .servicio
                                                                                ?.nombre
                                                                        }
                                                                    </p>

                                                                    <p className="text-sm">
                                                                        Cliente:{" "}
                                                                        {getFullName(
                                                                            cell
                                                                                .appointment
                                                                                .cliente
                                                                        )}
                                                                    </p>

                                                                    <p className="text-xs">
                                                                        {formatTime(
                                                                            cell
                                                                                .appointment
                                                                                .horaInicio
                                                                        )}{" "}
                                                                        -{" "}
                                                                        {formatTime(
                                                                            cell
                                                                                .appointment
                                                                                .horaFin
                                                                        )}
                                                                    </p>

                                                                    <Badge
                                                                        variant="outline"
                                                                        className={getStatusClass(
                                                                            cell
                                                                                .appointment
                                                                                .estadoCita
                                                                                ?.nombre
                                                                        )}
                                                                    >
                                                                        {cell
                                                                            .appointment
                                                                            .estadoCita
                                                                            ?.nombre ??
                                                                            "Sin estado"}
                                                                    </Badge>

                                                                    <p className="text-xs underline">
                                                                        Ver detalle
                                                                    </p>
                                                                </Link>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <p className="font-semibold">
                                                                        {
                                                                            cell.label
                                                                        }
                                                                    </p>

                                                                    {cell.type ===
                                                                        "restriction" && (
                                                                            <p className="text-xs">
                                                                                No
                                                                                disponible
                                                                            </p>
                                                                        )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                }
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}