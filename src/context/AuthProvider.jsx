import { useEffect, useState } from "react"
import {
  getAuthenticatedProfile,
  loginUser,
} from "@/services/authService"
import { AuthContext } from "@/context/auth-context"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("authToken")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await getAuthenticatedProfile()
        setUser(response.data)
      } catch {
        localStorage.removeItem("authToken")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  async function login(credentials) {
    const loginResponse = await loginUser(credentials)
    const token = loginResponse.data.token

    localStorage.setItem("authToken", token)

    try {
      const profileResponse = await getAuthenticatedProfile()
      setUser(profileResponse.data)
      return profileResponse.data
    } catch (error) {
      localStorage.removeItem("authToken")
      throw error
    }
  }

  function logout() {
    localStorage.removeItem("authToken")
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}