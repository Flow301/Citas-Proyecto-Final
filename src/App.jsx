import { Route, Routes } from "react-router"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { MainLayout } from "@/components/layout/MainLayout"
import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { RegisterPage } from "@/pages/RegisterPage"
import { ServiceDetailPage } from "@/pages/ServiceDetailPage"
import { ServicesPage } from "@/pages/ServicesPage"

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
        <Route path="/servicios/:id" element={<ServiceDetailPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App