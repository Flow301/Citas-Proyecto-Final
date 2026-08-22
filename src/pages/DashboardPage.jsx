import { Link } from "react-router"
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const publicSections = [
  {
    title: "Tutorías personalizadas",
    description:
      "Explora nuestras materias, precios, duración y opciones disponibles.",
    path: "/servicios",
    action: "Explorar servicios",
    icon: BookOpen,
    color:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  {
    title: "Horarios flexibles",
    description:
      "Consulta los días y rangos de atención del centro antes de reservar.",
    path: "/horarios",
    action: "Consultar horarios",
    icon: Clock,
    color:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    title: "Recursos adicionales",
    description:
      "Complementa tu tutoría con materiales y servicios adicionales.",
    path: "/servicios-adicionales",
    action: "Ver adicionales",
    icon: Sparkles,
    color:
      "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
]

const steps = [
  {
    number: "01",
    title: "Elige una tutoría",
    description:
      "Consulta las materias disponibles y selecciona la que necesitas.",
  },
  {
    number: "02",
    title: "Reserva tu espacio",
    description:
      "Selecciona un empleado, una fecha y una hora disponible.",
  },
  {
    number: "03",
    title: "Alcanza tus objetivos",
    description:
      "Recibe acompañamiento personalizado para fortalecer tus conocimientos.",
  },
]

function getRoleActions(user) {
  const roleName = user?.rol?.nombre

  if (roleName === "Administrador") {
    return [
      {
        title: "Agenda diaria",
        description:
          "Consulta la distribución de citas del establecimiento.",
        path: "/agenda-diaria",
        icon: CalendarDays,
      },
      {
        title: "Administrar citas",
        description:
          "Consulta y gestiona las citas registradas.",
        path: "/citas",
        icon: CalendarCheck,
      },
      {
        title: "Administrar empleados",
        description:
          "Consulta el personal y sus servicios asignados.",
        path: "/empleados",
        icon: UsersRound,
      },
      {
        title: "Administrar servicios",
        description:
          "Gestiona las tutorías ofrecidas por el centro.",
        path: "/servicios",
        icon: BookOpen,
      },
    ]
  }

  if (roleName === "Empleado") {
    const actions = [
      {
        title: "Citas asignadas",
        description:
          "Consulta las citas que tienes programadas.",
        path: "/citas",
        icon: CalendarCheck,
      },
      {
        title: "Restricciones",
        description:
          "Consulta los bloqueos que afectan la disponibilidad.",
        path: "/restricciones",
        icon: Clock,
      },
      {
        title: "Servicios",
        description:
          "Consulta las tutorías disponibles en el centro.",
        path: "/servicios",
        icon: BookOpen,
      },
    ]

    if (user?.empleado?.id) {
      actions.unshift({
        title: "Mi agenda",
        description:
          "Revisa tu jornada, citas y espacios disponibles.",
        path: `/empleados/${user.empleado.id}/agenda`,
        icon: CalendarDays,
      })
    }

    return actions
  }

  if (roleName === "Cliente") {
    return [
      {
        title: "Mis citas",
        description:
          "Consulta las tutorías que tienes reservadas.",
        path: "/citas",
        icon: CalendarCheck,
      },
      {
        title: "Explorar servicios",
        description:
          "Encuentra la tutoría adecuada para ti.",
        path: "/servicios",
        icon: BookOpen,
      },
      {
        title: "Horarios",
        description:
          "Consulta cuándo se encuentra abierto el centro.",
        path: "/horarios",
        icon: Clock,
      },
      {
        title: "Mi perfil",
        description:
          "Consulta la información de tu cuenta.",
        path: "/perfil",
        icon: UserRound,
      },
    ]
  }

  return []
}

export function DashboardPage() {
  const { user } = useAuth()

  const roleName = user?.rol?.nombre
  const firstName = user?.nombre
  const roleActions = getRoleActions(user)

  const heroTitle = firstName
    ? `¡Hola, ${firstName}!`
    : "Impulsa tu aprendizaje"

  const heroDescription = firstName
    ? "Todo lo que necesitas para gestionar tu experiencia en el Centro de Tutorías."
    : "Tutorías personalizadas, profesores preparados y horarios pensados para ayudarte a alcanzar tus objetivos académicos."

  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-12 text-primary-foreground shadow-lg sm:px-10 lg:px-14 lg:py-16">
        <div
          className="absolute -right-20 -top-24 size-72 rounded-full bg-white/10"
          aria-hidden="true"
        />

        <div
          className="absolute -bottom-32 right-32 size-64 rounded-full bg-white/5"
          aria-hidden="true"
        />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
              <GraduationCap
                className="size-4"
                aria-hidden="true"
              />
              Centro de Tutorías Académicas
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/80 sm:text-lg">
              {heroDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                nativeButton={false}
                variant="secondary"
                size="lg"
                render={
                  <Link
                    to={
                      roleName === "Cliente"
                        ? "/citas"
                        : "/servicios"
                    }
                  />
                }
              >
                {roleName === "Cliente"
                  ? "Ver mis citas"
                  : "Explorar tutorías"}

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </Button>

              {!user && (
                <Button
                  nativeButton={false}
                  size="lg"
                  className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
                  render={<Link to="/registro" />}
                >
                  Crear una cuenta
                </Button>
              )}
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <div className="flex size-56 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur">
              <div className="flex size-40 items-center justify-center rounded-full bg-white/10">
                <GraduationCap
                  className="size-24"
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {user && roleActions.length > 0 && (
        <section>
          <div className="mb-6">
            <p className="text-sm font-medium text-primary">
              PANEL DE {roleName?.toUpperCase()}
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Accesos rápidos
            </h2>

            <p className="mt-1 text-muted-foreground">
              Ingresa rápidamente a las funciones que utilizas
              con mayor frecuencia.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {roleActions.map((action) => {
              const Icon = action.icon

              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group"
                >
                  <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                    <CardHeader>
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon
                          className="size-5"
                          aria-hidden="true"
                        />
                      </div>

                      <CardTitle className="pt-2 text-lg">
                        {action.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">
            TODO EN UN SOLO LUGAR
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Conoce nuestro centro
          </h2>

          <p className="mt-3 text-muted-foreground">
            Encuentra la información que necesitas para
            planificar tu próxima tutoría.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {publicSections.map((section) => {
            const Icon = section.icon

            return (
              <Card
                key={section.path}
                className="group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader>
                  <div
                    className={`flex size-12 items-center justify-center rounded-2xl ${section.color}`}
                  >
                    <Icon
                      className="size-6"
                      aria-hidden="true"
                    />
                  </div>

                  <CardTitle className="pt-3 text-xl">
                    {section.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                  <p className="leading-7 text-muted-foreground">
                    {section.description}
                  </p>

                  <Button
                    nativeButton={false}
                    variant="ghost"
                    className="px-0 text-primary hover:bg-transparent"
                    render={<Link to={section.path} />}
                  >
                    {section.action}

                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="rounded-3xl border bg-muted/40 px-6 py-10 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <CheckCircle2
                className="size-6"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Aprender puede ser más sencillo
            </h2>

            <p className="mt-3 leading-7 text-muted-foreground">
              Te acompañamos desde la elección de la materia
              hasta el desarrollo de tu tutoría.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border bg-background p-5"
              >
                <p className="text-sm font-bold text-primary">
                  {step.number}
                </p>

                <h3 className="mt-3 font-semibold">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!user && (
        <section className="rounded-3xl bg-foreground px-6 py-10 text-center text-background sm:px-10">
          <h2 className="text-3xl font-bold">
            ¿Listo para comenzar?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-background/70">
            Crea una cuenta para consultar y administrar tus
            citas en el Centro de Tutorías.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              nativeButton={false}
              variant="secondary"
              render={<Link to="/registro" />}
            >
              Registrarme
            </Button>

            <Button
              nativeButton={false}
              className="border border-background/30 bg-transparent text-background hover:bg-background/10"
              render={<Link to="/login" />}
            >
              Iniciar sesión
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}