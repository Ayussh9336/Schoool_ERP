import type { User, UserRole } from "./types"
import { dataStore } from "./data-store"

// Simple session management (in a real app, use proper session management)
let currentUser: User | null = null

export const auth = {
  // Login function
  login: async (email: string, password: string): Promise<{ user: User | null; error?: string }> => {
    try {
      const user = dataStore.authenticateUser(email, password)
      if (user) {
        currentUser = user
        // In a real app, you'd set cookies/tokens here
        localStorage.setItem("currentUser", JSON.stringify(user))
        return { user }
      } else {
        return { user: null, error: "Invalid email or password" }
      }
    } catch (error) {
      return { user: null, error: "Login failed" }
    }
  },

  // Logout function
  logout: () => {
    currentUser = null
    localStorage.removeItem("currentUser")
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (currentUser) return currentUser

    // Try to restore from localStorage
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      try {
        currentUser = JSON.parse(stored)
        return currentUser
      } catch {
        localStorage.removeItem("currentUser")
      }
    }
    return null
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return auth.getCurrentUser() !== null
  },

  // Check user role
  hasRole: (role: UserRole): boolean => {
    const user = auth.getCurrentUser()
    return user?.role === role
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles: UserRole[]): boolean => {
    const user = auth.getCurrentUser()
    return user ? roles.includes(user.role) : false
  },
}
