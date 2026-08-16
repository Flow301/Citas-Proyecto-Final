import { apiRequest } from "@/services/api"

export async function loginUser(credentials) {
  return apiRequest("/usuarios/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

export async function getAuthenticatedProfile() {
  return apiRequest("/usuarios/perfil", {
    method: "GET",
  })
}

export async function registerClient(clientData) {
  return apiRequest("/usuarios/registro", {
    method: "POST",
    body: JSON.stringify(clientData),
  })
}