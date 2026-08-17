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
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App