"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/auth"
import type { User } from "@/lib/types"
import LoginForm from "@/components/login-form"
import StudentDashboard from "@/components/student-dashboard"
import TeacherDashboard from "@/components/teacher-dashboard"
import AdminDashboard from "@/components/admin-dashboard"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = auth.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    auth.logout()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case "student":
      return <StudentDashboard user={user} onLogout={handleLogout} />
    case "teacher":
      return <TeacherDashboard user={user} onLogout={handleLogout} />
    case "admin":
      return <AdminDashboard user={user} onLogout={handleLogout} />
    default:
      return <LoginForm onLogin={handleLogin} />
  }
}
