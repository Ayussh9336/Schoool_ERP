"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DashboardHeader from "@/components/dashboard-header"
import type { User, Student, Class, Assignment, Grade } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { BookOpen, Calendar, GraduationCap, TrendingUp } from "lucide-react"

interface StudentDashboardProps {
  user: User
  onLogout: () => void
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])

  useEffect(() => {
    // Get student data
    const studentData = dataStore.getStudentById(user.id) as Student
    setStudent(studentData)

    if (studentData) {
      // Get student's classes
      const studentClasses = dataStore.getClassesByStudent(user.id)
      setClasses(studentClasses)

      // Get assignments for student's classes
      const allAssignments = studentClasses.flatMap((cls) => dataStore.getAssignmentsByClass(cls.id))
      setAssignments(allAssignments)

      // Get student's grades
      const studentGrades = dataStore.getGradesByStudent(user.id)
      setGrades(studentGrades)
    }
  }, [user.id])

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0
    const total = grades.reduce((sum, grade) => sum + grade.percentage, 0)
    return Math.round(total / grades.length)
  }

  const getUpcomingAssignments = () => {
    const now = new Date()
    return assignments
      .filter((assignment) => new Date(assignment.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  }

  if (!student) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={onLogout} title={`Welcome, ${user.firstName}!`} />

      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">
                Grade {student.grade} - Section {student.section}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUpcomingAssignments().length}</div>
              <p className="text-xs text-muted-foreground">Due this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAverageGrade()}%</div>
              <p className="text-xs text-muted-foreground">Based on {grades.length} assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Student ID</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.studentId}</div>
              <p className="text-xs text-muted-foreground">
                Status:{" "}
                <Badge variant="secondary" className="text-xs">
                  {student.status}
                </Badge>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Your pending assignments and due dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getUpcomingAssignments().length > 0 ? (
                  getUpcomingAssignments().map((assignment) => {
                    const subject = dataStore.getSubjectById(assignment.subjectId)
                    const teacher = dataStore.getTeacherById(assignment.teacherId)
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{assignment.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {subject?.name} • {teacher?.firstName} {teacher?.lastName}
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
                  <p className="text-muted-foreground text-center py-4">No upcoming assignments</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>Your latest assignment results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {grades.length > 0 ? (
                  grades.slice(0, 5).map((grade) => {
                    const assignment = dataStore.getAssignmentById(grade.assignmentId)
                    const subject = assignment ? dataStore.getSubjectById(assignment.subjectId) : null
                    return (
                      <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{assignment?.title}</h4>
                          <p className="text-sm text-muted-foreground">{subject?.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{grade.grade}</div>
                          <p className="text-xs text-muted-foreground">
                            {grade.marksObtained}/{grade.maxMarks} ({grade.percentage}%)
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-4">No grades available yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
