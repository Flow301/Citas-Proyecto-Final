import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { calculateEndTime } from "@/lib/appointmentCalculations"
import {
    checkAppointmentAvailability,
    getActiveEmployeesForService,
    getActiveServicesForAppointments,
} from "@/services/appointmentService"

const initialFormData = {
    servicioId: "",
    empleadoId: "",
    fecha: "",
    horaInicio: "",
}

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

function getEmployeeName(employee) {
    const user = employee.usuario

    if (!user) {
        return "Empleado no disponible"
    }

    return [
        user.nombre,
        user.primerApellido,
        user.segundoApellido,
    ]
        .filter(Boolean)
        .join(" ")
}

export function AvailabilityPage() {
    const [formData, setFormData] = useState(initialFormData)
    const [services, setServices] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingEmployees, setLoadingEmployees] =
        useState(false)
    const [checking, setChecking] = useState(false)
    const [errors, setErrors] = useState({})
    const [result, setResult] = useState(null)

    useEffect(() => {
        let isActive = true

        getActiveServicesForAppointments()
            .then((response) => {
                if (isActive) {
                    setServices(response.data ?? [])
                }
            })
            .catch((requestError) => {
                if (isActive) {
                    setErrors({
                        form: requestError.message,
                    })
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
    }, [])

    useEffect(() => {
        if (!formData.servicioId) {
            return undefined
        }

        let isActive = true

        getActiveEmployeesForService(formData.servicioId)
            .then((response) => {
                if (isActive) {
                    setEmployees(response.data ?? [])
                }
            })
            .catch((requestError) => {
                if (isActive) {
                    setErrors((currentErrors) => ({
                        ...currentErrors,
                        empleadoId: requestError.message,
                    }))
                }
            })
            .finally(() => {
                if (isActive) {
                    setLoadingEmployees(false)
                }
            })

        return () => {
            isActive = false
        }
    }, [formData.servicioId])

    const selectedService = useMemo(
        () =>
            services.find(
                (service) =>
                    String(service.id) ===
                    String(formData.servicioId)
            ),
        [services, formData.servicioId]
    )

    const selectedEmployee = useMemo(
        () =>
            employees.find(
                (employee) =>
                    String(employee.id) ===
                    String(formData.empleadoId)
            ),
        [employees, formData.empleadoId]
    )

    const endTime = calculateEndTime(
        formData.horaInicio,
        selectedService?.duracionMinutos
    )

    function handleChange(field, value) {
        if (field === "servicioId") {
            setEmployees([])
            setLoadingEmployees(Boolean(value))
        }

        setFormData((currentData) => {
            if (field === "servicioId") {
                return {
                    ...currentData,
                    servicioId: value,
                    empleadoId: "",
                }
            }

            return {
                ...currentData,
                [field]: value,
            }
        })

        setErrors((currentErrors) => ({
            ...currentErrors,
            [field]: "",
            form: "",
        }))

        setResult(null)
    }

    function validateForm() {
        const newErrors = {}

        if (!formData.servicioId) {
            newErrors.servicioId =
                "Selecciona un servicio."
        }

        if (!formData.empleadoId) {
            newErrors.empleadoId =
                "Selecciona un empleado."
        }

        if (!formData.fecha) {
            newErrors.fecha = "Selecciona una fecha."
        } else if (formData.fecha < getCurrentDate()) {
            newErrors.fecha =
                "La fecha no puede estar en el pasado."
        }

        if (!formData.horaInicio) {
            newErrors.horaInicio =
                "Selecciona una hora de inicio."
        }

        if (formData.horaInicio && !endTime) {
            newErrors.horaInicio =
                "No se pudo calcular la hora final."
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setResult(null)

        if (!validateForm()) {
            return
        }

        setChecking(true)

        try {
            const response = await checkAppointmentAvailability({
                empleadoId: Number(formData.empleadoId),
                servicioId: Number(formData.servicioId),
                fecha: formData.fecha,
                horaInicio: formData.horaInicio,
                horaFin: endTime,
            })

            const availability = response.data ?? response
            const isAvailable =
                availability.disponible !== false

            setResult({
                available: isAvailable,
                message: isAvailable
                    ? "El horario seleccionado está disponible."
                    : availability.message ||
                    availability.mensaje ||
                    "El horario seleccionado no está disponible.",
            })
        } catch (requestError) {
            setResult({
                available: false,
                message: requestError.message,
            })
        } finally {
            setChecking(false)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                        Cargando servicios disponibles...
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Consultar disponibilidad
                </h1>

                <p className="text-muted-foreground">
                    Consulta si un empleado se encuentra disponible
                    para atender un servicio en la fecha y hora
                    seleccionadas.
                </p>
            </div>

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle>Datos de la consulta</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        {errors.form && (
                            <p role="alert" className="text-destructive">
                                {errors.form}
                            </p>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="availability-service">
                                    Servicio{" "}
                                    <span className="text-destructive">*</span>
                                </Label>

                                <Select
                                    value={formData.servicioId}
                                    onValueChange={(value) =>
                                        handleChange("servicioId", value)
                                    }
                                >
                                    <SelectTrigger id="availability-service">
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

                                {errors.servicioId && (
                                    <p className="text-sm text-destructive">
                                        {errors.servicioId}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="availability-employee">
                                    Empleado{" "}
                                    <span className="text-destructive">*</span>
                                </Label>

                                <Select
                                    value={formData.empleadoId}
                                    onValueChange={(value) =>
                                        handleChange("empleadoId", value)
                                    }
                                    disabled={
                                        !formData.servicioId ||
                                        loadingEmployees
                                    }
                                >
                                    <SelectTrigger id="availability-employee">
                                        <SelectValue>
                                            {loadingEmployees
                                                ? "Cargando empleados..."
                                                : selectedEmployee
                                                    ? getEmployeeName(selectedEmployee)
                                                    : "Selecciona un empleado"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {employees.map((employee) => (
                                            <SelectItem
                                                key={employee.id}
                                                value={String(employee.id)}
                                            >
                                                {getEmployeeName(employee)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.empleadoId && (
                                    <p className="text-sm text-destructive">
                                        {errors.empleadoId}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="availability-date">
                                    Fecha{" "}
                                    <span className="text-destructive">*</span>
                                </Label>

                                <Input
                                    id="availability-date"
                                    type="date"
                                    min={getCurrentDate()}
                                    value={formData.fecha}
                                    onChange={(event) =>
                                        handleChange(
                                            "fecha",
                                            event.target.value
                                        )
                                    }
                                    aria-invalid={Boolean(errors.fecha)}
                                />

                                {errors.fecha && (
                                    <p className="text-sm text-destructive">
                                        {errors.fecha}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="availability-start-time">
                                    Hora de inicio{" "}
                                    <span className="text-destructive">*</span>
                                </Label>

                                <Input
                                    id="availability-start-time"
                                    type="time"
                                    step="600"
                                    value={formData.horaInicio}
                                    onChange={(event) =>
                                        handleChange(
                                            "horaInicio",
                                            event.target.value
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        errors.horaInicio
                                    )}
                                />

                                {errors.horaInicio && (
                                    <p className="text-sm text-destructive">
                                        {errors.horaInicio}
                                    </p>
                                )}
                            </div>
                        </div>

                        {selectedService && (
                            <div className="grid gap-4 rounded-md border p-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Duración del servicio
                                    </p>

                                    <p className="font-semibold">
                                        {selectedService.duracionMinutos} minutos
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Hora de finalización
                                    </p>

                                    <p className="font-semibold">
                                        {endTime || "Selecciona una hora"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div
                                role="status"
                                className={
                                    result.available
                                        ? "rounded-md border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200"
                                        : "rounded-md border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200"
                                }
                            >
                                <p className="font-semibold">
                                    {result.available
                                        ? "Horario disponible"
                                        : "Horario no disponible"}
                                </p>

                                <p className="text-sm">{result.message}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={checking}
                        >
                            {checking
                                ? "Comprobando..."
                                : "Comprobar disponibilidad"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}