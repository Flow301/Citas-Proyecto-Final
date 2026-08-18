import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import {
    cancelAppointment,
    changeAppointmentStatus,
    getActiveAppointmentStatuses,
    getAppointmentById,
    getClientAppointments,
    getEmployeeAppointments,
} from "@/services/appointmentService"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function formatDate(dateValue) {
    if (!dateValue) {
        return "No disponible"
    }

    return new Intl.DateTimeFormat("es-CR", {
        dateStyle: "long",
        timeZone: "UTC",
    }).format(new Date(dateValue))
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

async function verifyAppointmentAccess(user, appointmentId) {
    const role = user.rol?.nombre

    if (role === "Administrador") {
        return true
    }

    let response

    if (role === "Empleado") {
        if (!user.empleado?.id) {
            return false
        }

        response = await getEmployeeAppointments(
            user.empleado.id
        )
    } else if (role === "Cliente") {
        response = await getClientAppointments(user.id)
    } else {
        return false
    }

    return (response.data ?? []).some(
        (appointment) =>
            String(appointment.id) === String(appointmentId)
    )
}

export function AppointmentDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const [appointment, setAppointment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [accessDenied, setAccessDenied] = useState(false)
    const [cancelDialogOpen, setCancelDialogOpen] =
        useState(false)
    const [cancellationReason, setCancellationReason] =
        useState("")
    const [cancelling, setCancelling] = useState(false)
    const [cancellationError, setCancellationError] =
        useState("")
    const [appointmentStatuses, setAppointmentStatuses] =
        useState([])
    const [selectedStatusId, setSelectedStatusId] =
        useState("")
    const [changingStatus, setChangingStatus] =
        useState(false)
    const [statusError, setStatusError] = useState("")
    const [statusDialogOpen, setStatusDialogOpen] =
        useState(false)

    useEffect(() => {
        let isActive = true

        async function loadAppointment() {
            setLoading(true)
            setError("")

            try {
                const hasAccess = await verifyAppointmentAccess(
                    user,
                    id
                )

                if (!hasAccess) {
                    if (isActive) {
                        setAccessDenied(true)
                    }

                    return
                }

                const response = await getAppointmentById(id)

                if (isActive) {
                    setAppointment(response.data)
                    setSelectedStatusId(
                        String(response.data.estadoCitaId)
                    )
                }
            } catch (requestError) {
                if (isActive) {
                    setError(requestError.message)
                }
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        loadAppointment()

        return () => {
            isActive = false
        }
    }, [id, user])

    useEffect(() => {
        const role = user.rol?.nombre

        if (
            role !== "Administrador" &&
            role !== "Empleado"
        ) {
            return undefined
        }

        let isActive = true

        getActiveAppointmentStatuses()
            .then((response) => {
                if (isActive) {
                    setAppointmentStatuses(response.data ?? [])
                }
            })
            .catch((requestError) => {
                if (isActive) {
                    setStatusError(requestError.message)
                }
            })

        return () => {
            isActive = false
        }
    }, [user])












    async function handleCancellation(event) {
        event.preventDefault()

        const trimmedReason = cancellationReason.trim()

        if (trimmedReason.length < 5) {
            setCancellationError(
                "El motivo debe tener al menos 5 caracteres."
            )
            return
        }

        if (trimmedReason.length > 255) {
            setCancellationError(
                "El motivo no puede superar 255 caracteres."
            )
            return
        }

        setCancelling(true)
        setCancellationError("")

        try {
            await cancelAppointment(id, trimmedReason)

            const response = await getAppointmentById(id)
            setAppointment(response.data)
            setSelectedStatusId(
                String(response.data.estadoCitaId)
            )

            setCancellationReason("")
            setCancelDialogOpen(false)
        } catch (requestError) {
            setCancellationError(requestError.message)
        } finally {
            setCancelling(false)
        }
    }

    async function handleStatusChange() {
        if (!selectedStatusId) {
            setStatusError("Selecciona un estado.")
            return
        }

        if (
            Number(selectedStatusId) ===
            Number(appointment.estadoCitaId)
        ) {
            setStatusError(
                "Selecciona un estado diferente al actual."
            )
            return
        }

        setChangingStatus(true)
        setStatusError("")

        try {
            await changeAppointmentStatus(
                id,
                selectedStatusId
            )

            const response = await getAppointmentById(id)
            setAppointment(response.data)
            setSelectedStatusId(
                String(response.data.estadoCitaId)
            )
            setStatusDialogOpen(false)
        } catch (requestError) {
            setStatusError(requestError.message)
        } finally {
            setChangingStatus(false)
        }
    }

    if (accessDenied) {
        return <Navigate to="/citas" replace />
    }

    if (loading) {
        return (
            <Card className="mx-auto max-w-4xl">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>

                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (error || !appointment) {
        return (
            <Card className="mx-auto max-w-3xl">
                <CardContent className="space-y-4 p-8 text-center">
                    <p role="alert" className="text-destructive">
                        {error || "No se encontró la cita."}
                    </p>

                    <Button
                        nativeButton={false}
                        variant="outline"
                        render={<Link to="/citas" />}
                    >
                        Volver a citas
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const additionalServices = appointment.adicionales ?? []

    const role = user.rol?.nombre
    const statusName = appointment.estadoCita?.nombre

    const isAlreadyClosed =
        statusName === "Cancelada" ||
        statusName === "Finalizada"

    const canChangeStatus =
        !isAlreadyClosed &&
        (role === "Administrador" ||
            role === "Empleado")

    const canEdit =
        Boolean(appointment.estadoCita?.permiteEdicion) &&
        (role === "Administrador" ||
            role === "Empleado")

    const canCancel =
        !isAlreadyClosed &&
        (role === "Administrador" ||
            role === "Empleado" ||
            (role === "Cliente" &&
                appointment.estadoCita
                    ?.permiteCancelacionCliente))

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between gap-3">
                <Button
                    nativeButton={false}
                    variant="outline"
                    render={<Link to="/citas" />}
                >
                    Volver a citas
                </Button>

                {canEdit && (
                    <Button
                        nativeButton={false}
                        variant="outline"
                        render={
                            <Link to={`/citas/${appointment.id}/editar`} />
                        }
                    >
                        Editar cita
                    </Button>
                )}

                {canCancel && (
                    <AlertDialog
                        open={cancelDialogOpen}
                        onOpenChange={(open) => {
                            setCancelDialogOpen(open)

                            if (!open) {
                                setCancellationError("")
                            }
                        }}
                    >
                        <AlertDialogTrigger
                            render={
                                <Button
                                    type="button"
                                    variant="destructive"
                                />
                            }
                        >
                            Cancelar cita
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    ¿Cancelar esta cita?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                    La cita cambiará al estado cancelado y dejará
                                    disponible el horario que ocupaba.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="space-y-2">
                                <Label htmlFor="cancellation-reason">
                                    Motivo de cancelación{" "}
                                    <span className="text-destructive">*</span>
                                </Label>

                                <Input
                                    id="cancellation-reason"
                                    value={cancellationReason}
                                    onChange={(event) => {
                                        setCancellationReason(event.target.value)

                                        if (cancellationError) {
                                            setCancellationError("")
                                        }
                                    }}
                                    maxLength={255}
                                    placeholder="Escribe el motivo de la cancelación"
                                    disabled={cancelling}
                                    aria-invalid={Boolean(cancellationError)}
                                    aria-describedby={
                                        cancellationError
                                            ? "cancellation-error"
                                            : undefined
                                    }
                                />

                                <div className="flex justify-between gap-4 text-sm">
                                    {cancellationError ? (
                                        <p
                                            id="cancellation-error"
                                            role="alert"
                                            className="text-destructive"
                                        >
                                            {cancellationError}
                                        </p>
                                    ) : (
                                        <span />
                                    )}

                                    <span className="text-muted-foreground">
                                        {cancellationReason.length}/255
                                    </span>
                                </div>
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={cancelling}>
                                    Volver
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    onClick={handleCancellation}
                                    disabled={cancelling}
                                >
                                    {cancelling
                                        ? "Cancelando..."
                                        : "Confirmar cancelación"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <Card className="mx-auto max-w-4xl">
                <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">
                                {appointment.servicio?.nombre ??
                                    "Detalle de la cita"}
                            </CardTitle>

                            <p className="text-muted-foreground">
                                {formatDate(appointment.fecha)}
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
                </CardHeader>

                <CardContent className="space-y-8">
                    {canChangeStatus && (
                        <div className="rounded-lg border p-4">
                            <h2 className="font-semibold">
                                Cambiar estado de la cita
                            </h2>

                            <p className="mb-4 text-sm text-muted-foreground">
                                Selecciona el nuevo estado. La API verificará que la
                                transición esté permitida.
                            </p>

                            <div className="flex flex-wrap items-end gap-3">
                                <div className="min-w-56 flex-1 space-y-2">
                                    <Label htmlFor="appointment-status">
                                        Nuevo estado
                                    </Label>

                                    <select
                                        id="appointment-status"
                                        value={selectedStatusId}
                                        onChange={(event) => {
                                            setSelectedStatusId(event.target.value)
                                            setStatusError("")
                                        }}
                                        disabled={changingStatus}
                                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    >
                                        {appointmentStatuses.map((status) => (
                                            <option
                                                key={status.id}
                                                value={String(status.id)}
                                            >
                                                {status.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <AlertDialog
                                    open={statusDialogOpen}
                                    onOpenChange={setStatusDialogOpen}
                                >
                                    <AlertDialogTrigger
                                        render={
                                            <Button
                                                type="button"
                                                disabled={
                                                    changingStatus ||
                                                    !selectedStatusId ||
                                                    Number(selectedStatusId) ===
                                                    Number(appointment.estadoCitaId)
                                                }
                                            />
                                        }
                                    >
                                        Cambiar estado
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                ¿Cambiar el estado de la cita?
                                            </AlertDialogTitle>

                                            <AlertDialogDescription>
                                                El estado cambiará de{" "}
                                                <strong>{statusName}</strong> a{" "}
                                                <strong>
                                                    {appointmentStatuses.find(
                                                        (status) =>
                                                            String(status.id) ===
                                                            String(selectedStatusId)
                                                    )?.nombre ?? "el estado seleccionado"}
                                                </strong>
                                                .
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel
                                                disabled={changingStatus}
                                            >
                                                Volver
                                            </AlertDialogCancel>

                                            <AlertDialogAction
                                                onClick={(event) => {
                                                    event.preventDefault()
                                                    handleStatusChange()
                                                }}
                                                disabled={changingStatus}
                                            >
                                                {changingStatus
                                                    ? "Actualizando..."
                                                    : "Confirmar cambio"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            {statusError && (
                                <p
                                    role="alert"
                                    className="mt-3 text-sm text-destructive"
                                >
                                    {statusError}
                                </p>
                            )}
                        </div>
                    )}
                    <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <dt className="text-sm text-muted-foreground">
                                Horario
                            </dt>

                            <dd className="font-semibold">
                                {formatTime(appointment.horaInicio)} -{" "}
                                {formatTime(appointment.horaFin)}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm text-muted-foreground">
                                Duración
                            </dt>

                            <dd className="font-semibold">
                                {appointment.duracionMinutos} minutos
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm text-muted-foreground">
                                Cliente
                            </dt>

                            <dd className="font-semibold">
                                {getFullName(appointment.cliente)}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm text-muted-foreground">
                                Empleado
                            </dt>

                            <dd className="font-semibold">
                                {getFullName(
                                    appointment.empleado?.usuario
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm text-muted-foreground">
                                Precio del servicio
                            </dt>

                            <dd className="font-semibold">
                                {formatPrice(appointment.precioServicio)}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm text-muted-foreground">
                                Costo total
                            </dt>

                            <dd className="font-semibold">
                                {formatPrice(appointment.costoTotal)}
                            </dd>
                        </div>
                    </dl>

                    <div>
                        <h2 className="mb-3 text-lg font-semibold">
                            Servicios adicionales
                        </h2>

                        {additionalServices.length === 0 ? (
                            <p className="text-muted-foreground">
                                Esta cita no incluye servicios adicionales.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {additionalServices.map((additional) => (
                                    <div
                                        key={additional.id}
                                        className="flex flex-wrap justify-between gap-3 rounded-md border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {additional.nombre}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {additional.descripcion}
                                            </p>
                                        </div>

                                        <p className="font-semibold">
                                            {formatPrice(additional.precio)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Observaciones
                        </p>

                        <p className="leading-7">
                            {appointment.observaciones ||
                                "Sin observaciones"}
                        </p>
                    </div>

                    {appointment.motivoCancelacion && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4">
                            <p className="font-medium text-red-800">
                                Motivo de cancelación
                            </p>

                            <p className="text-red-700">
                                {appointment.motivoCancelacion}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}