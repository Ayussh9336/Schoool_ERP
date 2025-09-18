"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DashboardHeader from "@/components/dashboard-header"
import StudentManagement from "@/components/student-management"
import CourseManagement from "@/components/course-management"
import ReportsManagement from "@/components/reports-management"
import TeacherManagement from "@/components/teacher-management"
import type { User, Admin } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { Users, GraduationCap, BookOpen, ClipboardList, ArrowLeft } from "lucide-react"

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

type AdminView = "dashboard" | "students" | "courses" | "teachers" | "reports"

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [currentView, setCurrentView] = useState<AdminView>("dashboard")
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
  })

  useEffect(() => {
    // Get admin data
    const adminData = dataStore.getUserById(user.id) as Admin
    setAdmin(adminData)

    // Calculate statistics
    const students = dataStore.getStudents()
    const teachers = dataStore.getTeachers()
    const classes = dataStore.getClasses()
    const subjects = dataStore.getSubjects()

    setStats({
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      totalSubjects: subjects.length,
    })
  }, [user.id])

  if (!admin) {
    return <div>Loading...</div>
  }

  if (currentView !== "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} onLogout={onLogout} title="Admin Dashboard" />
        <main className="p-6">
          <div className="mb-4">
            <Button variant="ghost" onClick={() => setCurrentView("dashboard")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          {currentView === "students" && <StudentManagement />}
          {currentView === "courses" && <CourseManagement />}
          {currentView === "teachers" && <TeacherManagement />}
          {currentView === "reports" && <ReportsManagement />}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={onLogout} title="Admin Dashboard" />

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Active enrollments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground">Faculty members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
              <p className="text-xs text-muted-foreground">Active classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubjects}</div>
              <p className="text-xs text-muted-foreground">Available subjects</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Key metrics and system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Active Students</h4>
                    <p className="text-sm text-muted-foreground">Currently enrolled</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Teaching Staff</h4>
                    <p className="text-sm text-muted-foreground">Active faculty</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalTeachers}</div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Course Offerings</h4>
                    <p className="text-sm text-muted-foreground">Available subjects</p>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{stats.totalSubjects}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentView("students")}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">Manage Students</h4>
                  <p className="text-sm text-muted-foreground">Add, edit, or remove student records</p>
                </button>
                <button
                  onClick={() => setCurrentView("teachers")}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">Manage Teachers</h4>
                  <p className="text-sm text-muted-foreground">Faculty management and assignments</p>
                </button>
                <button
                  onClick={() => setCurrentView("courses")}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">Course Management</h4>
                  <p className="text-sm text-muted-foreground">Create and manage courses</p>
                </button>
                <button
                  onClick={() => setCurrentView("reports")}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">Generate Reports</h4>
                  <p className="text-sm text-muted-foreground">Academic and administrative reports</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
