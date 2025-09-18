"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DashboardHeader from "@/components/dashboard-header"
import ClassManagement from "@/components/class-management"
import AssignmentManagement from "@/components/assignment-management"
import GradeManagement from "@/components/grade-management"
import type { User, Teacher, Class, Assignment } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { BookOpen, Users, Calendar, ClipboardList, ArrowLeft } from "lucide-react"

interface TeacherDashboardProps {
  user: User
  onLogout: () => void
}

type TeacherView = "dashboard" | "classes" | "assignments" | "grades" | "students"

export default function TeacherDashboard({ user, onLogout }: TeacherDashboardProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [currentView, setCurrentView] = useState<TeacherView>("dashboard")
  const [classes, setClasses] = useState<Class[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [totalStudents, setTotalStudents] = useState(0)

  useEffect(() => {
    // Get teacher data
    const teacherData = dataStore.getTeacherById(user.id) as Teacher
    setTeacher(teacherData)

    if (teacherData) {
      // Get teacher's classes
      const teacherClasses = dataStore.getClassesByTeacher(user.id)
      setClasses(teacherClasses)

      // Get teacher's assignments
      const teacherAssignments = dataStore.getAssignmentsByTeacher(user.id)
      setAssignments(teacherAssignments)

      // Calculate total students
      const uniqueStudents = new Set()
      teacherClasses.forEach((cls) => {
        cls.enrolledStudents.forEach((studentId) => uniqueStudents.add(studentId))
      })
      setTotalStudents(uniqueStudents.size)
    }
  }, [user.id])

  const getRecentAssignments = () => {
    return assignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  }

  const refreshData = () => {
    if (teacher) {
      const teacherClasses = dataStore.getClassesByTeacher(user.id)
      setClasses(teacherClasses)
      const teacherAssignments = dataStore.getAssignmentsByTeacher(user.id)
      setAssignments(teacherAssignments)
    }
  }

  if (!teacher) {
    return <div>Loading...</div>
  }

  // Render different views based on currentView
  if (currentView !== "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} onLogout={onLogout} title="Teacher Dashboard" />
        <main className="p-6">
          <div className="mb-4">
            <Button variant="ghost" onClick={() => setCurrentView("dashboard")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {currentView === "classes" && <ClassManagement teacherId={user.id} />}
          {currentView === "assignments" && <AssignmentManagement teacherId={user.id} onDataChange={refreshData} />}
          {currentView === "grades" && <GradeManagement teacherId={user.id} />}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={onLogout} title={`Welcome, ${user.firstName}!`} />

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">Department: {teacher.department}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">Created this semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experience</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacher.experience}</div>
              <p className="text-xs text-muted-foreground">Years of teaching</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common teaching tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentView("classes")}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">Manage Classes</h4>
                  <p className="text-sm text-muted-foreground">View and manage your classes and students</p>
                </button>
                <button
                  onClick={() => setCurrentView("assignments")}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">Create Assignment</h4>
                  <p className="text-sm text-muted-foreground">Create and manage assignments</p>
                </button>
                <button
                  onClick={() => setCurrentView("grades")}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h4 className="font-medium">Grade Assignments</h4>
                  <p className="text-sm text-muted-foreground">Review and grade student submissions</p>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium">Take Attendance</h4>
                  <p className="text-sm text-muted-foreground">Mark student attendance for classes</p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
              <CardDescription>Assignments you've created recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getRecentAssignments().length > 0 ? (
                  getRecentAssignments().map((assignment) => {
                    const subject = dataStore.getSubjectById(assignment.subjectId)
                    const cls = dataStore.getClassById(assignment.classId)
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{assignment.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {subject?.name} • {cls?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={assignment.type === "exam" ? "destructive" : "secondary"}>
                            {assignment.type}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-4">No assignments created yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
