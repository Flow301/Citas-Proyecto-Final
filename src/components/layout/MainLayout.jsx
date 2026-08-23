import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router"
import { GraduationCap } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/common/ThemeToggle"
import { cn } from "@/lib/utils"

const authenticatedRoles = [
  "Administrador",
  "Empleado",
  "Cliente",
]

const navigationItems = [
  {
    label: "Inicio",
    path: "/",
  },
  {
    label: "Mi perfil",
    path: "/perfil",
    roles: authenticatedRoles,
  },
  {
    label: "Servicios",
    path: "/servicios",
  },
  {
    label: "Horarios",
    path: "/horarios",
  },
  {
    label: "Disponibilidad",
    path: "/disponibilidad",
    roles: authenticatedRoles,
  },
  {
    label: "Adicionales",
    path: "/servicios-adicionales",
  },
  {
    label: "Empleados",
    path: "/empleados",
    roles: ["Administrador", "Empleado"],
  },
  {
    label: "Restricciones",
    path: "/restricciones",
    roles: ["Administrador", "Empleado"],
  },
  {
    label: "Citas",
    path: "/citas",
    roles: ["Administrador"],
  },
  {
    label: "Citas asignadas",
    path: "/citas",
    roles: ["Empleado"],
  },
  {
    label: "Mis citas",
    path: "/citas",
    roles: ["Cliente"],
  },
  {
    label: "Agenda diaria",
    path: "/agenda-diaria",
    roles: ["Administrador"],
  },
]

export function MainLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const roleName = user?.rol?.nombre

  const navigationWithEmployeeAgenda = [
    ...navigationItems,
    ...(roleName === "Empleado" && user?.empleado?.id
      ? [
        {
          label: "Mi agenda",
          path: `/empleados/${user.empleado.id}/agenda`,
          roles: ["Empleado"],
        },
      ]
      : []),
  ]

  const visibleNavigationItems =
    navigationWithEmployeeAgenda.filter(
      (item) =>
        !item.roles ||
        item.roles.includes(roleName)
    )

  const fullName = user
    ? [user.nombre, user.primerApellido]
      .filter(Boolean)
      .join(" ")
    : ""

  function handleLogout() {
    logout()
    navigate("/", { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <NavLink
              to="/"
              className="flex items-center gap-3"
              aria-label="Ir al inicio"
            >
              <div className="rounded-md bg-primary p-2 text-primary-foreground">
                <GraduationCap
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="font-semibold">
                  Centro de Tutorías
                </p>

                <p className="text-xs text-muted-foreground">
                  Gestión académica
                </p>
              </div>
            </NavLink>

            {user ? (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">
                    {fullName}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {roleName}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <ThemeToggle />

                <Button
                  nativeButton={false}
                  variant="outline"
                  render={<NavLink to="/login" />}
                >
                  Iniciar sesión
                </Button>

                <Button
                  nativeButton={false}
                  render={<NavLink to="/registro" />}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>

          <nav
            aria-label="Navegación principal"
            className="flex flex-wrap gap-2"
          >
            {visibleNavigationItems.map((item) => (
              <NavLink
                key={`${item.label}-${item.path}`}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t bg-background">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <NavLink
              to="/"
              className="inline-flex items-center gap-3"
              aria-label="Ir al inicio"
            >
              <div className="rounded-md bg-primary p-2 text-primary-foreground">
                <GraduationCap
                  className="size-5"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="font-semibold">
                  Centro de Tutorías
                </p>

                <p className="text-xs text-muted-foreground">
                  Gestión académica
                </p>
              </div>
            </NavLink>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Tutorías personalizadas para reforzar tus
              conocimientos y ayudarte a alcanzar tus objetivos
              académicos.
            </p>
          </div>

          <div>
            <h2 className="font-semibold">
              Información
            </h2>

            <nav
              aria-label="Enlaces informativos"
              className="mt-4 flex flex-col items-start gap-3"
            >
              <NavLink
                to="/servicios"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Servicios
              </NavLink>

              <NavLink
                to="/horarios"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Horarios de atención
              </NavLink>

              <NavLink
                to="/servicios-adicionales"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Servicios adicionales
              </NavLink>
            </nav>
          </div>

          <div>
            <h2 className="font-semibold">
              {user ? "Mi cuenta" : "Acceso"}
            </h2>

            <nav
              aria-label="Enlaces de cuenta"
              className="mt-4 flex flex-col items-start gap-3"
            >
              {user ? (
                <>
                  <NavLink
                    to="/perfil"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Mi perfil
                  </NavLink>

                  <NavLink
                    to="/citas"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {roleName === "Cliente"
                      ? "Mis citas"
                      : roleName === "Empleado"
                        ? "Citas asignadas"
                        : "Administrar citas"}
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Iniciar sesión
                  </NavLink>

                  <NavLink
                    to="/registro"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Crear una cuenta
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        </div>

        <div className="border-t">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-center text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
            <p>
              © {new Date().getFullYear()} Centro de Tutorías
              Académicas.
            </p>

            <p>
              Proyecto académico desarrollado con React.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}