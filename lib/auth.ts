let currentUser = null

export async function signIn(email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data = await response.json()
      currentUser = data.user

      // Set a flag in sessionStorage to indicate a fresh login
      sessionStorage.setItem("justLoggedIn", "true")

      return true
    }
    return false
  } catch (error) {
    console.error("Sign in error:", error)
    return false
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })

    return response.ok
  } catch (error) {
    console.error("Registration error:", error)
    return false
  }
}

export async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/me")
    if (response.ok) {
      const data = await response.json()
      currentUser = data.user
      return true
    }
    return false
  } catch (error) {
    console.error("Auth check error:", error)
    return false
  }
}

export async function logout(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })

    if (response.ok) {
      currentUser = null
      return true
    }
    return false
  } catch (error) {
    console.error("Logout error:", error)
    return false
  }
}

export function getCurrentUser() {
  return currentUser
}

