import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { RoleRoute } from "@/components/auth/RoleRoute"
import { MainLayout } from "@/components/layout/MainLayout"

function lazyNamed(importFunction, exportName) {
  return lazy(() =>
    importFunction().then((module) => ({
      default: module[exportName],
    }))
  )
}

const DashboardPage = lazyNamed(
  () => import("@/pages/DashboardPage"),
  "DashboardPage"
)

const LoginPage = lazyNamed(
  () => import("@/pages/LoginPage"),
  "LoginPage"
)

const NotFoundPage = lazyNamed(
  () => import("@/pages/NotFoundPage"),
  "NotFoundPage"
)

const ProfilePage = lazyNamed(
  () => import("@/pages/ProfilePage"),
  "ProfilePage"
)

const RegisterPage = lazyNamed(
  () => import("@/pages/RegisterPage"),
  "RegisterPage"
)

const ServiceDetailPage = lazyNamed(
  () => import("@/pages/ServiceDetailPage"),
  "ServiceDetailPage"
)

const ServiceFormPage = lazyNamed(
  () => import("@/pages/ServiceFormPage"),
  "ServiceFormPage"
)

const ServicesPage = lazyNamed(
  () => import("@/pages/ServicesPage"),
  "ServicesPage"
)

const AdditionalServicesPage = lazyNamed(
  () => import("@/pages/AdditionalServicesPage"),
  "AdditionalServicesPage"
)

const CreateAdditionalServicePage = lazyNamed(
  () => import("@/pages/CreateAdditionalServicePage"),
  "CreateAdditionalServicePage"
)

const AdditionalServiceDetailPage = lazyNamed(
  () => import("@/pages/AdditionalServiceDetailPage"),
  "AdditionalServiceDetailPage"
)

const EditAdditionalServicePage = lazyNamed(
  () => import("@/pages/EditAdditionalServicePage"),
  "EditAdditionalServicePage"
)

const EmployeesPage = lazyNamed(
  () => import("@/pages/EmployeesPage"),
  "EmployeesPage"
)

const EmployeeDetailPage = lazyNamed(
  () => import("@/pages/EmployeeDetailPage"),
  "EmployeeDetailPage"
)

const CreateEmployeePage = lazyNamed(
  () => import("@/pages/CreateEmployeePage"),
  "CreateEmployeePage"
)

const EditEmployeePage = lazyNamed(
  () => import("@/pages/EditEmployeePage"),
  "EditEmployeePage"
)

const EmployeeAgendaPage = lazyNamed(
  () => import("@/pages/EmployeeAgendaPage"),
  "EmployeeAgendaPage"
)

const RestrictionsPage = lazyNamed(
  () => import("@/pages/RestrictionsPage"),
  "RestrictionsPage"
)

const CreateRestrictionPage = lazyNamed(
  () => import("@/pages/CreateRestrictionPage"),
  "CreateRestrictionPage"
)

const EditRestrictionPage = lazyNamed(
  () => import("@/pages/EditRestrictionPage"),
  "EditRestrictionPage"
)

const RestrictionDetailPage = lazyNamed(
  () => import("@/pages/RestrictionDetailPage"),
  "RestrictionDetailPage"
)

const SchedulesPage = lazyNamed(
  () => import("@/pages/SchedulesPage"),
  "SchedulesPage"
)

const AppointmentsPage = lazyNamed(
  () => import("@/pages/AppointmentsPage"),
  "AppointmentsPage"
)

const AppointmentDetailPage = lazyNamed(
  () => import("@/pages/AppointmentDetailPage"),
  "AppointmentDetailPage"
)

const CreateAppointmentPage = lazyNamed(
  () => import("@/pages/CreateAppointmentPage"),
  "CreateAppointmentPage"
)

const EditAppointmentPage = lazyNamed(
  () => import("@/pages/EditAppointmentPage"),
  "EditAppointmentPage"
)

const DailyAgendaPage = lazyNamed(
  () => import("@/pages/DailyAgendaPage"),
  "DailyAgendaPage"
)

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Cargando página...
          </p>
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        <Route element={<MainLayout />}>

          <Route index element={<DashboardPage />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/servicios" element={<ServicesPage />} />

          <Route
            path="/servicios-adicionales"
            element={<AdditionalServicesPage />}
          />

          <Route
            path="/servicios-adicionales/nuevo"
            element={
              <RoleRoute allowedRoles={["Administrador"]}>
                <CreateAdditionalServicePage />
              </RoleRoute>
            }
          />
          <Route
            path="/servicios-adicionales/:id/editar"
            element={
              <RoleRoute allowedRoles={["Administrador"]}>
                <EditAdditionalServicePage />
              </RoleRoute>
            }
          />
          <Route
            path="/servicios-adicionales/:id"
            element={<AdditionalServiceDetailPage />}
          />

          <Route
            path="/servicios/nuevo"
            element={
              <RoleRoute allowedRoles={["Administrador"]}>
                <ServiceFormPage />
              </RoleRoute>
            }
          />

          <Route
            path="/servicios/:id/editar"
            element={
              <RoleRoute allowedRoles={["Administrador"]}>
                <ServiceFormPage />
              </RoleRoute>
            }
          />

          <Route
            path="/servicios/:id"
            element={<ServiceDetailPage />}
          />

          <Route
            path="/empleados"
            element={
              <RoleRoute
                allowedRoles={["Administrador", "Empleado"]}
              >
                <EmployeesPage />
              </RoleRoute>
            }
          />

          <Route
            path="/empleados/nuevo"
            element={
              <RoleRoute allowedRoles={["Administrador"]}>
                <CreateEmployeePage />
              </RoleRoute>
            }
          />

          <Route
            path="/empleados/:id/editar"
            element={
              <RoleRoute allowedRoles={["Administrador"]}>
                <EditEmployeePage />
              </RoleRoute>
            }
          />

          <Route
            path="/empleados/:id"
            element={
              <RoleRoute
                allowedRoles={["Administrador", "Empleado"]}
              >
                <EmployeeDetailPage />
              </RoleRoute>
            }
          />

          <Route
            path="/empleados/:id/agenda"
            element={
              <RoleRoute
                allowedRoles={["Administrador", "Empleado"]}
              >
                <EmployeeAgendaPage />
              </RoleRoute>
            }
          />

          <Route
            path="/restricciones"
            element={
              <RoleRoute
                allowedRoles={["Administrador", "Empleado"]}
              >
                <RestrictionsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/restricciones/nueva"
            element={
              <RoleRoute allowedRoles={["Administrador"]}>
                <CreateRestrictionPage />
              </RoleRoute>
            }
          />

          <Route
            path="/restricciones/:id/editar"
            element={
              <RoleRoute allowedRoles={["Administrador"]}>
                <EditRestrictionPage />
              </RoleRoute>
            }
          />

          <Route
            path="/restricciones/:id"
            element={
              <RoleRoute
                allowedRoles={["Administrador", "Empleado"]}
              >
                <RestrictionDetailPage />
              </RoleRoute>
            }
          />

          <Route
            path="/horarios"
            element={<SchedulesPage />}
          />

          <Route
            path="/citas"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/citas/nueva"
            element={
              <RoleRoute
                allowedRoles={["Administrador", "Empleado"]}
              >
                <CreateAppointmentPage />
              </RoleRoute>
            }
          />

          <Route
            path="/citas/:id/editar"
            element={
              <RoleRoute
                allowedRoles={["Administrador", "Empleado"]}
              >
                <EditAppointmentPage />
              </RoleRoute>
            }
          />

          <Route
            path="/citas/:id"
            element={
              <ProtectedRoute>
                <AppointmentDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agenda-diaria"
            element={
              <RoleRoute allowedRoles={["Administrador"]}>
                <DailyAgendaPage />
              </RoleRoute>
            }
          />





        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App