import { Route, Routes } from "react-router"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { RoleRoute } from "@/components/auth/RoleRoute"
import { MainLayout } from "@/components/layout/MainLayout"
import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ServiceDetailPage } from "@/pages/ServiceDetailPage"
import { ServiceFormPage } from "@/pages/ServiceFormPage"
import { ServicesPage } from "@/pages/ServicesPage"
import { AdditionalServicesPage } from "@/pages/AdditionalServicesPage"
import { CreateAdditionalServicePage } from "@/pages/CreateAdditionalServicePage"
import { AdditionalServiceDetailPage } from "@/pages/AdditionalServiceDetailPage"
import { EditAdditionalServicePage } from "@/pages/EditAdditionalServicePage"
import { EmployeesPage } from "@/pages/EmployeesPage"
import { EmployeeDetailPage } from "@/pages/EmployeeDetailPage"
import { CreateEmployeePage } from "@/pages/CreateEmployeePage"
import { EditEmployeePage } from "@/pages/EditEmployeePage"
import { EmployeeAgendaPage } from "@/pages/EmployeeAgendaPage"
import { RestrictionsPage } from "@/pages/RestrictionsPage"
import { RestrictionDetailPage } from "@/pages/RestrictionDetailPage"
import { SchedulesPage } from "@/pages/SchedulesPage"
import { AppointmentsPage } from "@/pages/AppointmentsPage"
import { AppointmentDetailPage } from "@/pages/AppointmentDetailPage"
import { CreateAppointmentPage } from "@/pages/CreateAppointmentPage"
import { EditAppointmentPage } from "@/pages/EditAppointmentPage"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
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
          element={<AppointmentsPage />}
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
          element={<AppointmentDetailPage />}
        />





      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App