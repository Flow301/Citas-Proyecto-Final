import fs from "node:fs"
import path from "node:path"
import process from "node:process"

loadSeedEnvironment()

const API_URL =
  process.env.SEED_API_URL || "http://localhost:3000"

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD
const USER_PASSWORD = process.env.SEED_USER_PASSWORD

const clients = [
  {
    nombre: "Daniela",
    primerApellido: "Mora",
    segundoApellido: "Rojas",
    correo: "daniela.cliente@tutorias.test",
    telefono: "8701-1001",
  },
  {
    nombre: "Sebastián",
    primerApellido: "Vargas",
    segundoApellido: "Solano",
    correo: "sebastian.cliente@tutorias.test",
    telefono: "8701-1002",
  },
]

const employeeUsers = [
  {
    nombre: "Andrea",
    primerApellido: "Jiménez",
    segundoApellido: "Castro",
    correo: "andrea.empleada@tutorias.test",
    telefono: "8801-2001",
  },
  {
    nombre: "Carlos",
    primerApellido: "Ramírez",
    segundoApellido: "Soto",
    correo: "carlos.empleado@tutorias.test",
    telefono: "8801-2002",
  },
  {
    nombre: "Mariana",
    primerApellido: "Fernández",
    segundoApellido: "León",
    correo: "mariana.empleada@tutorias.test",
    telefono: "8801-2003",
  },
  {
  nombre: "Luis",
  primerApellido: "Chaves",
  segundoApellido: "Alvarado",
  correo: "luis.empleado@tutorias.test",
  telefono: "8801-2004",
},
]

const employeeProfiles = [
  {
    correo: "andrea.empleada@tutorias.test",
    codigoEmpleado: "TUT-MAT-001",
    descripcion:
      "Tutora especializada en matemática, cálculo y física.",
    servicios: [
      "Tutoría de Matemática",
      "Tutoría de Cálculo",
      "Tutoría de Física",
    ],
  },
  {
    correo: "carlos.empleado@tutorias.test",
    codigoEmpleado: "TUT-TEC-002",
    descripcion:
      "Tutor especializado en programación, matemática y cálculo.",
    servicios: [
      "Tutoría de Programación",
      "Tutoría de Matemática",
      "Tutoría de Cálculo",
    ],
  },
  {
    correo: "mariana.empleada@tutorias.test",
    codigoEmpleado: "TUT-GEN-003",
    descripcion:
      "Tutora de inglés, física y materias académicas generales.",
    servicios: [
      "Tutoría de Inglés",
      "Tutoría de Física",
      "Tutoría de Matemática",
      "Tutoría de Cálculo",
    ],
  },
]

const openingHours = [
  {
    dia: "Lunes",
    horaInicio: "08:00",
    horaFin: "17:00",
  },
  {
    dia: "Martes",
    horaInicio: "08:00",
    horaFin: "17:00",
  },
  {
    dia: "Miércoles",
    horaInicio: "08:00",
    horaFin: "17:00",
  },
  {
    dia: "Jueves",
    horaInicio: "08:00",
    horaFin: "17:00",
  },
  {
    dia: "Viernes",
    horaInicio: "08:00",
    horaFin: "17:00",
  },
  {
    dia: "Sábado",
    horaInicio: "08:00",
    horaFin: "12:00",
  },
]

const scheduleRestrictions = [
  {
    tipo: "general",
    codigoEmpleado: null,
    fecha: "2026-09-15",
    horaInicio: null,
    horaFin: null,
    todoElDia: true,
    motivo: "Cierre general por feriado nacional.",
  },
  {
    tipo: "general",
    codigoEmpleado: null,
    fecha: "2026-12-24",
    horaInicio: "12:00",
    horaFin: "17:00",
    todoElDia: false,
    motivo: "Cierre general anticipado por celebración.",
  },
  {
    tipo: "empleado",
    codigoEmpleado: "TUT-MAT-001",
    fecha: "2026-09-18",
    horaInicio: "09:00",
    horaFin: "11:00",
    todoElDia: false,
    motivo: "Capacitación académica de la tutora.",
  },
  {
    tipo: "empleado",
    codigoEmpleado: "TUT-TEC-002",
    fecha: "2026-09-19",
    horaInicio: "09:00",
    horaFin: "11:00",
    todoElDia: false,
    motivo: "Cita médica programada del tutor.",
  },
  {
    tipo: "empleado",
    codigoEmpleado: "TUT-GEN-003",
    fecha: "2026-09-21",
    horaInicio: "08:00",
    horaFin: "10:00",
    todoElDia: false,
    motivo: "Reunión académica interna de la tutora.",
  },
  {
    tipo: "parcial",
    codigoEmpleado: null,
    fecha: "2026-10-02",
    horaInicio: "10:00",
    horaFin: "12:00",
    todoElDia: false,
    motivo: "Mantenimiento parcial de las instalaciones.",
  },
  {
    tipo: "parcial",
    codigoEmpleado: "TUT-MAT-001",
    fecha: "2026-10-05",
    horaInicio: "14:00",
    horaFin: "16:00",
    todoElDia: false,
    motivo: "Bloqueo parcial para actividad institucional.",
  },
  {
    tipo: "completo",
    codigoEmpleado: null,
    fecha: "2026-12-25",
    horaInicio: null,
    horaFin: null,
    todoElDia: true,
    motivo: "Cierre del establecimiento durante todo el día.",
  },
]

const appointments = [
  {
    reference: "SEED-CITA-01",
    estadoFinal: "Finalizada",
    clienteCorreo: "daniela.cliente@tutorias.test",
    codigoEmpleado: "TUT-MAT-001",
    servicio: "Tutoría de Matemática",
    adicionales: ["Material impreso"],
    fecha: "2026-10-02",
    horaInicio: "08:00",
  },
  {
    reference: "SEED-CITA-02",
    estadoFinal: "Finalizada",
    clienteCorreo: "sebastian.cliente@tutorias.test",
    codigoEmpleado: "TUT-TEC-002",
    servicio: "Tutoría de Programación",
    adicionales: ["Guía de ejercicios"],
    fecha: "2026-10-05",
    horaInicio: "09:00",
  },
  {
    reference: "SEED-CITA-03",
    estadoFinal: "Finalizada",
    clienteCorreo: "daniela.cliente@tutorias.test",
    codigoEmpleado: "TUT-GEN-003",
    servicio: "Tutoría de Inglés",
    adicionales: ["Resumen digital"],
    fecha: "2026-10-06",
    horaInicio: "10:00",
  },
  {
    reference: "SEED-CITA-04",
    estadoFinal: "Cancelada",
    clienteCorreo: "sebastian.cliente@tutorias.test",
    codigoEmpleado: "TUT-MAT-001",
    servicio: "Tutoría de Cálculo",
    adicionales: [],
    fecha: "2026-10-07",
    horaInicio: "13:00",
  },
  {
    reference: "SEED-CITA-05",
    estadoFinal: "Cancelada",
    clienteCorreo: "daniela.cliente@tutorias.test",
    codigoEmpleado: "TUT-TEC-002",
    servicio: "Tutoría de Matemática",
    adicionales: ["Revisión de tarea"],
    fecha: "2026-10-08",
    horaInicio: "14:00",
  },
  {
    reference: "SEED-CITA-06",
    estadoFinal: "Pendiente",
    clienteCorreo: "daniela.cliente@tutorias.test",
    codigoEmpleado: "TUT-MAT-001",
    servicio: "Tutoría de Matemática",
    adicionales: ["Material impreso"],
    fecha: "2026-10-12",
    horaInicio: "08:00",
  },
  {
    reference: "SEED-CITA-07",
    estadoFinal: "Pendiente",
    clienteCorreo: "sebastian.cliente@tutorias.test",
    codigoEmpleado: "TUT-TEC-002",
    servicio: "Tutoría de Programación",
    adicionales: ["Ejercicios resueltos"],
    fecha: "2026-10-12",
    horaInicio: "10:00",
  },
  {
    reference: "SEED-CITA-08",
    estadoFinal: "Pendiente",
    clienteCorreo: "daniela.cliente@tutorias.test",
    codigoEmpleado: "TUT-GEN-003",
    servicio: "Tutoría de Inglés",
    adicionales: ["Consulta posterior"],
    fecha: "2026-10-12",
    horaInicio: "13:00",
  },
  {
    reference: "SEED-CITA-09",
    estadoFinal: "Pendiente",
    clienteCorreo: "sebastian.cliente@tutorias.test",
    codigoEmpleado: "TUT-MAT-001",
    servicio: "Tutoría de Física",
    adicionales: ["Guía de ejercicios"],
    fecha: "2026-10-13",
    horaInicio: "15:00",
  },
  {
    reference: "SEED-CITA-10",
    estadoFinal: "Confirmada",
    clienteCorreo: "daniela.cliente@tutorias.test",
    codigoEmpleado: "TUT-TEC-002",
    servicio: "Tutoría de Matemática",
    adicionales: ["Resumen digital"],
    fecha: "2026-10-14",
    horaInicio: "08:00",
  },
  {
    reference: "SEED-CITA-11",
    estadoFinal: "Confirmada",
    clienteCorreo: "sebastian.cliente@tutorias.test",
    codigoEmpleado: "TUT-GEN-003",
    servicio: "Tutoría de Física",
    adicionales: ["Material impreso"],
    fecha: "2026-10-14",
    horaInicio: "10:00",
  },
  {
    reference: "SEED-CITA-12",
    estadoFinal: "Confirmada",
    clienteCorreo: "daniela.cliente@tutorias.test",
    codigoEmpleado: "TUT-MAT-001",
    servicio: "Tutoría de Cálculo",
    adicionales: ["Simulacro de examen"],
    fecha: "2026-10-14",
    horaInicio: "13:00",
  },
  {
    reference: "SEED-CITA-13",
    estadoFinal: "Confirmada",
    clienteCorreo: "sebastian.cliente@tutorias.test",
    codigoEmpleado: "TUT-TEC-002",
    servicio: "Tutoría de Programación",
    adicionales: ["Seguimiento semanal"],
    fecha: "2026-10-15",
    horaInicio: "15:00",
  },
]

const services = [
  {
    nombre: "Tutoría de Matemática",
    descripcion:
      "Tutoría personalizada de matemática general para estudiantes.",
    precioBase: 10000,
    duracionMinutos: 60,
  },
  {
    nombre: "Tutoría de Cálculo",
    descripcion:
      "Apoyo académico en límites, derivadas, integrales y aplicaciones.",
    precioBase: 12000,
    duracionMinutos: 90,
  },
  {
    nombre: "Tutoría de Programación",
    descripcion:
      "Tutoría práctica de lógica, algoritmos y programación básica.",
    precioBase: 15000,
    duracionMinutos: 90,
  },
  {
    nombre: "Tutoría de Física",
    descripcion:
      "Apoyo en mecánica, movimiento, fuerzas, energía y resolución de problemas.",
    precioBase: 12000,
    duracionMinutos: 60,
  },
  {
    nombre: "Tutoría de Inglés",
    descripcion:
      "Práctica guiada de gramática, vocabulario y conversación en inglés.",
    precioBase: 10000,
    duracionMinutos: 60,
  },
]

const additionals = [
  {
    nombre: "Material impreso",
    descripcion:
      "Resumen impreso con los principales contenidos estudiados.",
    precio: 1500,
  },
  {
    nombre: "Guía de ejercicios",
    descripcion:
      "Guía adicional de ejercicios para practicar después de la tutoría.",
    precio: 2000,
  },
  {
    nombre: "Revisión de tarea",
    descripcion:
      "Revisión detallada de una tarea académica antes de entregarla.",
    precio: 3000,
  },
  {
    nombre: "Simulacro de examen",
    descripcion:
      "Prueba práctica preparada según los contenidos indicados.",
    precio: 5000,
  },
  {
    nombre: "Seguimiento semanal",
    descripcion:
      "Seguimiento adicional del progreso académico durante una semana.",
    precio: 4000,
  },
  {
    nombre: "Resumen digital",
    descripcion:
      "Documento digital con explicaciones y ejemplos de la materia.",
    precio: 1000,
  },
  {
    nombre: "Ejercicios resueltos",
    descripcion:
      "Colección de ejercicios explicados y resueltos paso a paso.",
    precio: 2500,
  },
  {
    nombre: "Consulta posterior",
    descripcion:
      "Espacio breve para resolver dudas después de finalizar la tutoría.",
    precio: 2000,
  },
]

let authToken = ""

function loadSeedEnvironment() {
  const environmentPath = path.resolve(".env.seed")

  if (!fs.existsSync(environmentPath)) {
    return
  }

  const content = fs.readFileSync(environmentPath, "utf8")

  for (const originalLine of content.split(/\r?\n/)) {
    const line = originalLine.trim()

    if (!line || line.startsWith("#")) {
      continue
    }

    const separatorIndex = line.indexOf("=")

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function validateEnvironment() {
  const missingVariables = []

  if (!ADMIN_EMAIL) {
    missingVariables.push("SEED_ADMIN_EMAIL")
  }

  if (!ADMIN_PASSWORD) {
    missingVariables.push("SEED_ADMIN_PASSWORD")
  }

  if (!USER_PASSWORD) {
    missingVariables.push("SEED_USER_PASSWORD")
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Faltan variables en .env.seed: ${missingVariables.join(", ")}`
    )
  }
}

async function apiRequest(endpoint, options = {}) {
  const headers = new Headers(options.headers)

  if (options.body) {
    headers.set("Content-Type", "application/json")
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  let result

  try {
    result = await response.json()
  } catch {
    result = null
  }

  if (!response.ok) {
    const validationMessage = result?.validationErrors
      ?.map((error) => `${error.field}: ${error.message}`)
      .join("; ")

    throw new Error(
      validationMessage ||
        result?.message ||
        `Error HTTP ${response.status} en ${endpoint}`
    )
  }

  return result
}

async function login() {
  const response = await apiRequest("/usuarios/login", {
    method: "POST",
    body: JSON.stringify({
      correo: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  })

  authToken = response.data.token
  console.log("✓ Sesión de administrador iniciada")
}

async function getUsers() {
  const response = await apiRequest("/usuarios", {
    method: "GET",
  })

  return response.data || []
}

async function registerUserIfMissing(user, existingUsers) {
  const existingUser = existingUsers.find(
    (item) => item.correo === user.correo
  )

  if (existingUser) {
    console.log(`- Usuario existente: ${user.correo}`)
    return existingUser
  }

  const response = await apiRequest("/usuarios/registro", {
    method: "POST",
    body: JSON.stringify({
      ...user,
      password: USER_PASSWORD,
    }),
  })

  console.log(`✓ Usuario registrado: ${user.correo}`)
  return response.data
}

async function seedUsers() {
  console.log("\nUsuarios")

  let existingUsers = await getUsers()

  for (const client of clients) {
    await registerUserIfMissing(client, existingUsers)
    existingUsers = await getUsers()
  }

  for (const employeeUser of employeeUsers) {
    await registerUserIfMissing(
      employeeUser,
      existingUsers
    )

    existingUsers = await getUsers()
  }

  const rolesResponse = await apiRequest("/roles", {
    method: "GET",
  })

  const employeeRole = rolesResponse.data?.find(
    (role) => role.nombre === "Empleado"
  )

  if (!employeeRole) {
    throw new Error(
      "No se encontró el rol Empleado en el API."
    )
  }

  for (const employeeUser of employeeUsers) {
    const registeredUser = existingUsers.find(
      (user) => user.correo === employeeUser.correo
    )

    if (!registeredUser) {
      throw new Error(
        `No se encontró el usuario ${employeeUser.correo}`
      )
    }

    if (registeredUser.rol?.nombre === "Empleado") {
      console.log(
        `- El usuario ya es empleado: ${employeeUser.correo}`
      )
      continue
    }

    await apiRequest(`/usuarios/${registeredUser.id}`, {
      method: "PUT",
      body: JSON.stringify({
        nombre: registeredUser.nombre,
        primerApellido: registeredUser.primerApellido,
        segundoApellido:
          registeredUser.segundoApellido || null,
        correo: registeredUser.correo,
        telefono: registeredUser.telefono || null,
        rolId: employeeRole.id,
      }),
    })

    console.log(
      `✓ Rol Empleado asignado: ${employeeUser.correo}`
    )
  }
}

async function seedServices() {
  console.log("\nServicios")

  const [servicesResponse, specialtiesResponse] =
    await Promise.all([
      apiRequest("/servicios", {
        method: "GET",
      }),
      apiRequest("/especialidades", {
        method: "GET",
      }),
    ])

  const existingServices = servicesResponse.data || []
  const specialties = specialtiesResponse.data || []

  const generalSpecialty =
    specialties.find(
      (specialty) => specialty.nombre === "General"
    ) || specialties[0]

  if (!generalSpecialty) {
    throw new Error(
      "No existe ninguna especialidad para crear servicios."
    )
  }

  for (const service of services) {
    const alreadyExists = existingServices.some(
      (item) => item.nombre === service.nombre
    )

    if (alreadyExists) {
      console.log(`- Servicio existente: ${service.nombre}`)
      continue
    }

    await apiRequest("/servicios", {
      method: "POST",
      body: JSON.stringify({
        ...service,
        especialidadId: generalSpecialty.id,
        imagen: null,
      }),
    })

    console.log(`✓ Servicio creado: ${service.nombre}`)
  }
}

async function seedAdditionals() {
  console.log("\nServicios adicionales")

  const response = await apiRequest(
    "/servicios-adicionales",
    {
      method: "GET",
    }
  )

  const existingAdditionals = response.data || []

  for (const additional of additionals) {
    const alreadyExists = existingAdditionals.some(
      (item) => item.nombre === additional.nombre
    )

    if (alreadyExists) {
      console.log(
        `- Adicional existente: ${additional.nombre}`
      )
      continue
    }

    await apiRequest("/servicios-adicionales", {
      method: "POST",
      body: JSON.stringify(additional),
    })

    console.log(
      `✓ Adicional creado: ${additional.nombre}`
    )
  }
}

function normalizeText(textValue) {
  return String(textValue || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function findRestrictionType(types, typeKey) {
  const searchWords = {
    general: ["general"],
    empleado: ["empleado"],
    parcial: ["parcial"],
    completo: ["completo"],
  }

  const words = searchWords[typeKey] || []

  return types.find((type) => {
    const normalizedName = normalizeText(type.nombre)

    return words.some((word) =>
      normalizedName.includes(word)
    )
  })
}

function addMinutesToTime(startTime, minutes) {
  const [hours, currentMinutes] = startTime
    .split(":")
    .map(Number)

  const totalMinutes =
    hours * 60 + currentMinutes + Number(minutes)

  const finalHours = Math.floor(totalMinutes / 60)
  const finalMinutes = totalMinutes % 60

  return `${String(finalHours).padStart(2, "0")}:${String(
    finalMinutes
  ).padStart(2, "0")}`
}

function normalizeTime(timeValue) {
  if (!timeValue) {
    return ""
  }

  return String(timeValue).slice(0, 5)
}

async function seedEmployees() {
  console.log("\nEmpleados")

  const [
    usersResponse,
    servicesResponse,
    specialtiesResponse,
    employeesResponse,
  ] = await Promise.all([
    apiRequest("/usuarios?rol=Empleado", {
      method: "GET",
    }),
    apiRequest("/servicios", {
      method: "GET",
    }),
    apiRequest("/especialidades", {
      method: "GET",
    }),
    apiRequest("/empleados", {
      method: "GET",
    }),
  ])

  const employeeUsersFromApi = usersResponse.data || []
  const availableServices = servicesResponse.data || []
  const specialties = specialtiesResponse.data || []
  const existingEmployees = employeesResponse.data || []

  const generalSpecialty =
    specialties.find(
      (specialty) => specialty.nombre === "General"
    ) || specialties[0]

  if (!generalSpecialty) {
    throw new Error(
      "No existe ninguna especialidad para crear empleados."
    )
  }

  for (const employeeProfile of employeeProfiles) {
    const user = employeeUsersFromApi.find(
      (item) => item.correo === employeeProfile.correo
    )

    if (!user) {
      throw new Error(
        `No se encontró el usuario empleado ${employeeProfile.correo}. Ejecuta primero: npm run seed -- usuarios`
      )
    }

    const existingEmployee = existingEmployees.find(
      (employee) =>
        employee.usuarioId === user.id ||
        employee.codigoEmpleado ===
          employeeProfile.codigoEmpleado
    )

    if (existingEmployee) {
      console.log(
        `- Empleado existente: ${employeeProfile.codigoEmpleado}`
      )
      continue
    }

    const assignedServices = employeeProfile.servicios.map(
      (serviceName) => {
        const service = availableServices.find(
          (item) => item.nombre === serviceName
        )

        if (!service) {
          throw new Error(
            `No se encontró el servicio "${serviceName}". Ejecuta primero: npm run seed -- servicios`
          )
        }

        return service.id
      }
    )

    await apiRequest("/empleados", {
      method: "POST",
      body: JSON.stringify({
        usuarioId: user.id,
        especialidadId: generalSpecialty.id,
        codigoEmpleado: employeeProfile.codigoEmpleado,
        descripcion: employeeProfile.descripcion,
        servicioIds: assignedServices,
      }),
    })

    console.log(
      `✓ Empleado creado: ${employeeProfile.codigoEmpleado}`
    )
  }
}

async function seedOpeningHours() {
  console.log("\nHorarios de atención")

  const [daysResponse, schedulesResponse] =
    await Promise.all([
      apiRequest("/dias-semana", {
        method: "GET",
      }),
      apiRequest("/horarios-atencion", {
        method: "GET",
      }),
    ])

  const days = daysResponse.data || []
  const existingSchedules = schedulesResponse.data || []

  for (const openingHour of openingHours) {
    const day = days.find(
      (item) =>
        item.nombre
          .localeCompare(openingHour.dia, "es", {
            sensitivity: "base",
          }) === 0
    )

    if (!day) {
      throw new Error(
        `No se encontró el día "${openingHour.dia}" en el API.`
      )
    }

    const alreadyExists = existingSchedules.some(
      (schedule) =>
        schedule.diaSemanaId === day.id &&
        normalizeTime(schedule.horaInicio) ===
          openingHour.horaInicio &&
        normalizeTime(schedule.horaFin) ===
          openingHour.horaFin
    )

    if (alreadyExists) {
      console.log(
        `- Horario existente: ${openingHour.dia} ${openingHour.horaInicio}-${openingHour.horaFin}`
      )
      continue
    }

    await apiRequest("/horarios-atencion", {
      method: "POST",
      body: JSON.stringify({
        diaSemanaId: day.id,
        horaInicio: openingHour.horaInicio,
        horaFin: openingHour.horaFin,
      }),
    })

    console.log(
      `✓ Horario creado: ${openingHour.dia} ${openingHour.horaInicio}-${openingHour.horaFin}`
    )
  }
}

async function seedRestrictions() {
  console.log("\nRestricciones de horario")

  const [
    typesResponse,
    employeesResponse,
    restrictionsResponse,
  ] = await Promise.all([
    apiRequest("/tipos-restriccion-horario", {
      method: "GET",
    }),
    apiRequest("/empleados", {
      method: "GET",
    }),
    apiRequest("/restricciones-horario", {
      method: "GET",
    }),
  ])

  const restrictionTypes = typesResponse.data || []
  const employees = employeesResponse.data || []
  const existingRestrictions =
    restrictionsResponse.data || []

  for (const restriction of scheduleRestrictions) {
    const restrictionType = findRestrictionType(
      restrictionTypes,
      restriction.tipo
    )

    if (!restrictionType) {
      const availableNames = restrictionTypes
        .map((type) => type.nombre)
        .join(", ")

      throw new Error(
        `No se encontró el tipo "${restriction.tipo}". Tipos disponibles: ${availableNames}`
      )
    }

    let employeeId = null

    if (restriction.codigoEmpleado) {
      const employee = employees.find(
        (item) =>
          item.codigoEmpleado ===
          restriction.codigoEmpleado
      )

      if (!employee) {
        throw new Error(
          `No se encontró el empleado ${restriction.codigoEmpleado}. Ejecuta primero: npm run seed -- empleados`
        )
      }

      employeeId = employee.id
    }

    const alreadyExists = existingRestrictions.some(
      (item) =>
        String(item.fecha).slice(0, 10) ===
          restriction.fecha &&
        item.motivo === restriction.motivo
    )

    if (alreadyExists) {
      console.log(
        `- Restricción existente: ${restriction.motivo}`
      )
      continue
    }

    await apiRequest("/restricciones-horario", {
      method: "POST",
      body: JSON.stringify({
        tipoRestriccionId: restrictionType.id,
        empleadoId: employeeId,
        fecha: restriction.fecha,
        horaInicio: restriction.horaInicio,
        horaFin: restriction.horaFin,
        todoElDia: restriction.todoElDia,
        motivo: restriction.motivo,
      }),
    })

    console.log(
      `✓ Restricción creada: ${restriction.motivo}`
    )
  }
}

async function seedAppointments() {
  console.log("\nCitas")

  const [
    usersResponse,
    profileResponse,
    employeesResponse,
    servicesResponse,
    additionalsResponse,
    statusesResponse,
    appointmentsResponse,
  ] = await Promise.all([
    apiRequest("/usuarios", {
      method: "GET",
    }),
    apiRequest("/usuarios/perfil", {
      method: "GET",
    }),
    apiRequest("/empleados", {
      method: "GET",
    }),
    apiRequest("/servicios", {
      method: "GET",
    }),
    apiRequest("/servicios-adicionales", {
      method: "GET",
    }),
    apiRequest("/estados-cita", {
      method: "GET",
    }),
    apiRequest("/citas", {
      method: "GET",
    }),
  ])

  const users = usersResponse.data || []
  const administrator = profileResponse.data
  const employees = employeesResponse.data || []
  const availableServices = servicesResponse.data || []
  const availableAdditionals =
    additionalsResponse.data || []
  const statuses = statusesResponse.data || []
  const existingAppointments =
    appointmentsResponse.data || []

  function findStatus(statusName) {
    return statuses.find(
      (status) =>
        normalizeText(status.nombre) ===
        normalizeText(statusName)
    )
  }

  const pendingStatus = findStatus("Pendiente")
  const confirmedStatus = findStatus("Confirmada")
  const inProgressStatus = findStatus("En proceso")
  const finishedStatus = findStatus("Finalizada")

  if (
    !pendingStatus ||
    !confirmedStatus ||
    !inProgressStatus ||
    !finishedStatus
  ) {
    const availableStatuses = statuses
      .map((status) => status.nombre)
      .join(", ")

    throw new Error(
      `Faltan estados de cita. Estados disponibles: ${availableStatuses}`
    )
  }

  for (const appointment of appointments) {
    const alreadyExists = existingAppointments.some(
      (item) =>
        item.observaciones?.includes(appointment.reference)
    )

    if (alreadyExists) {
      console.log(
        `- Cita existente: ${appointment.reference}`
      )
      continue
    }

    const client = users.find(
      (user) => user.correo === appointment.clienteCorreo
    )

    const employee = employees.find(
      (item) =>
        item.codigoEmpleado === appointment.codigoEmpleado
    )

    const service = availableServices.find(
      (item) => item.nombre === appointment.servicio
    )

    if (!client) {
      throw new Error(
        `No se encontró el cliente ${appointment.clienteCorreo}`
      )
    }

    if (!employee) {
      throw new Error(
        `No se encontró el empleado ${appointment.codigoEmpleado}`
      )
    }

    if (!service) {
      throw new Error(
        `No se encontró el servicio ${appointment.servicio}`
      )
    }

    const selectedAdditionals = appointment.adicionales.map(
      (additionalName) => {
        const additional = availableAdditionals.find(
          (item) => item.nombre === additionalName
        )

        if (!additional) {
          throw new Error(
            `No se encontró el adicional ${additionalName}`
          )
        }

        return additional
      }
    )

    const duration = Number(service.duracionMinutos)
    const servicePrice = Number(service.precioBase)

    const additionalCost = selectedAdditionals.reduce(
      (total, additional) =>
        total + Number(additional.precio),
      0
    )

    const endTime = addMinutesToTime(
      appointment.horaInicio,
      duration
    )

    const createResponse = await apiRequest("/citas", {
      method: "POST",
      body: JSON.stringify({
        clienteId: client.id,
        empleadoId: employee.id,
        servicioId: service.id,
        estadoCitaId: pendingStatus.id,
        creadoPorUsuarioId: administrator.id,
        fecha: appointment.fecha,
        horaInicio: appointment.horaInicio,
        horaFin: endTime,
        duracionMinutos: duration,
        precioServicio: servicePrice,
        costoAdicionales: additionalCost,
        costoTotal: servicePrice + additionalCost,
        observaciones: `${appointment.reference}: datos iniciales para pruebas.`,
        adicionalIds: selectedAdditionals.map(
          (additional) => additional.id
        ),
      }),
    })

    let createdAppointmentId = createResponse.data?.id

    if (!createdAppointmentId) {
      const refreshedResponse = await apiRequest("/citas", {
        method: "GET",
      })

      const createdAppointment = (
        refreshedResponse.data || []
      ).find((item) =>
        item.observaciones?.includes(appointment.reference)
      )

      createdAppointmentId = createdAppointment?.id
    }

    if (!createdAppointmentId) {
      throw new Error(
        `La cita ${appointment.reference} fue creada, pero no se pudo obtener su ID.`
      )
    }

    if (appointment.estadoFinal === "Confirmada") {
      await apiRequest(
        `/citas/${createdAppointmentId}/estado`,
        {
          method: "PATCH",
          body: JSON.stringify({
            estadoCitaId: confirmedStatus.id,
          }),
        }
      )
    }

    if (appointment.estadoFinal === "Finalizada") {
      for (const status of [
        confirmedStatus,
        inProgressStatus,
        finishedStatus,
      ]) {
        await apiRequest(
          `/citas/${createdAppointmentId}/estado`,
          {
            method: "PATCH",
            body: JSON.stringify({
              estadoCitaId: status.id,
            }),
          }
        )
      }
    }

    if (appointment.estadoFinal === "Cancelada") {
      await apiRequest(
        `/citas/${createdAppointmentId}/cancelar`,
        {
          method: "PATCH",
          body: JSON.stringify({
            motivoCancelacion:
              "Cancelación creada como dato inicial de prueba.",
          }),
        }
      )
    }

    console.log(
      `✓ Cita creada: ${appointment.reference} (${appointment.estadoFinal})`
    )
  }
}

async function main() {
  validateEnvironment()
  await login()

  const requestedSection = process.argv[2] || "todos"

  const sections = {
  usuarios: seedUsers,
  servicios: seedServices,
  adicionales: seedAdditionals,
  empleados: seedEmployees,
  horarios: seedOpeningHours,
  restricciones: seedRestrictions,
  citas: seedAppointments,
}

  if (requestedSection === "todos") {
    for (const section of Object.values(sections)) {
      await section()
    }
  } else {
    const section = sections[requestedSection]

    if (!section) {
      throw new Error(
        `Sección desconocida: ${requestedSection}`
      )
    }

    await section()
  }

  console.log("\n✓ Proceso terminado correctamente")
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}`)
  process.exitCode = 1
})