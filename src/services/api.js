const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(endpoint, options = {}) {
  const headers = new Headers(options.headers)

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const token = localStorage.getItem("authToken")

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  let response

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Verifica que el API esté funcionando."
    )
  }

let result

try {
  result = await response.json()
} catch {
  result = null
}

  if (!response.ok) {
    const error = new Error(
      result?.message || "Ocurrió un error al procesar la solicitud."
    )

    error.status = response.status
    error.validationErrors = result?.validationErrors || []

    throw error
  }

  return result
}