import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router"
import { GraduationCap } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
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
    <div className="min-h-screen bg-muted/40">
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

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}