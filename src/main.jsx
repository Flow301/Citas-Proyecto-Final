import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { AuthProvider } from "@/context/AuthProvider"
import App from "./App.jsx"
import "./index.css"
import { ThemeProvider } from "@/context/ThemeProvider"

createRoot(document.getElementById("root")).render(
  <StrictMode>
  <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
</StrictMode>
)