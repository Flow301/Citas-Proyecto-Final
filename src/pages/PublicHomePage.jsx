import { Link } from "react-router"
import {
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const publicSections = [
  {
    title: "Servicios de tutoría",
    description:
      "Consulta las materias, precios y duración de nuestras tutorías.",
    path: "/servicios",
    action: "Ver servicios",
    icon: BookOpen,
  },
  {
    title: "Horarios de atención",
    description:
      "Conoce los días y horas en que se encuentra abierto el centro.",
    path: "/horarios",
    action: "Ver horarios",
    icon: Clock,
  },
  {
    title: "Servicios adicionales",
    description:
      "Descubre los materiales y complementos disponibles para las citas.",
    path: "/servicios-adicionales",
    action: "Ver adicionales",
    icon: CalendarDays,
  },
]

export function PublicHomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-xl border bg-background px-6 py-12 text-center sm:px-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <GraduationCap
            className="size-7"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Centro de Tutorías Académicas
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Tutorías personalizadas para reforzar tus
          conocimientos y avanzar en tus objetivos académicos.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link to="/servicios" />}
          >
            Explorar servicios
          </Button>

          <Button
            nativeButton={false}
            variant="outline"
            render={<Link to="/registro" />}
          >
            Crear una cuenta
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">
          Información del centro
        </h2>

        <p className="mt-1 text-muted-foreground">
          Puedes consultar nuestra información sin iniciar
          sesión.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {publicSections.map((section) => {
            const Icon = section.icon

            return (
              <Card key={section.path}>
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                    <Icon
                      className="size-5"
                      aria-hidden="true"
                    />
                  </div>

                  <CardTitle className="pt-2">
                    {section.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {section.description}
                  </p>

                  <Button
                    nativeButton={false}
                    variant="outline"
                    render={<Link to={section.path} />}
                  >
                    {section.action}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-background p-6 text-center">
        <h2 className="text-xl font-semibold">
          ¿Ya tienes una cuenta?
        </h2>

        <p className="mt-2 text-muted-foreground">
          Inicia sesión para consultar tus citas y las
          funciones disponibles según tu rol.
        </p>

        <Button
          nativeButton={false}
          className="mt-4"
          render={<Link to="/login" />}
        >
          Iniciar sesión
        </Button>
      </section>
    </div>
  )
}