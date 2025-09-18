"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Student, Class, Grade, Assignment } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { Mail, Phone, MapPin, Calendar, GraduationCap } from "lucide-react"

interface StudentProfileProps {
  student: Student
  onClose: () => void
}

export default function StudentProfile({ student, onClose }: StudentProfileProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    // Get student's classes
    const studentClasses = dataStore.getClassesByStudent(student.id)
    setClasses(studentClasses)

    // Get student's grades
    const studentGrades = dataStore.getGradesByStudent(student.id)
    setGrades(studentGrades)

    // Get assignments for student's classes
    const allAssignments = studentClasses.flatMap((cls) => dataStore.getAssignmentsByClass(cls.id))
    setAssignments(allAssignments)
  }, [student.id])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "graduated":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0
    const total = grades.reduce((sum, grade) => sum + grade.percentage, 0)
    return Math.round(total / grades.length)
  }

  const getGradeDistribution = () => {
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    grades.forEach((grade) => {
      const letter = grade.grade.charAt(0) as keyof typeof distribution
      if (letter in distribution) {
        distribution[letter]++
      }
    })
    return distribution
  }

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <div className="flex items-start space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-blue-600 text-white text-lg">
            {getInitials(student.firstName, student.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-2xl font-bold">
            {student.firstName} {student.lastName}
          </h3>
          <p className="text-gray-600 mb-2">{student.email}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <GraduationCap className="h-4 w-4" />
              <span>
                Grade {student.grade} - Section {student.section}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>ID: {student.studentId}</span>
            </div>
            <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classes.length}</div>
                <p className="text-xs text-muted-foreground">Active enrollments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateAverageGrade()}%</div>
                <p className="text-xs text-muted-foreground">Based on {grades.length} assignments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <p className="text-xs text-muted-foreground">Total assignments</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                  <p>{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Enrollment Date</Label>
                  <p>{new Date(student.enrollmentDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Address</Label>
                <p>{student.address}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Classes</CardTitle>
              <CardDescription>Current class enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classes.length > 0 ? (
                  classes.map((cls) => {
                    const subject = dataStore.getSubjectById(cls.subjectId)
                    const teacher = dataStore.getTeacherById(cls.teacherId)
                    return (
                      <div key={cls.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{cls.name}</h4>
                          <p className="text-sm text-gray-500">
                            {subject?.name} • {teacher?.firstName} {teacher?.lastName}
                          </p>
                        </div>
                        <Badge variant="secondary">{cls.academicYear}</Badge>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No classes enrolled</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(getGradeDistribution()).map(([grade, count]) => (
                    <div key={grade} className="flex items-center justify-between">
                      <span className="font-medium">Grade {grade}</span>
                      <span className="text-sm text-gray-500">{count} assignments</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {grades.slice(0, 5).map((grade) => {
                    const assignment = dataStore.getAssignmentById(grade.assignmentId)
                    return (
                      <div key={grade.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{assignment?.title}</p>
                          <p className="text-xs text-gray-500">{new Date(grade.gradedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{grade.grade}</p>
                          <p className="text-xs text-gray-500">{grade.percentage}%</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
              </div>
              {student.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-gray-600">{student.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-gray-600">{student.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={`text-sm font-medium text-gray-700 ${className || ""}`} {...props}>
      {children}
    </label>
  )
}
