"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Class, Student } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { Users, BookOpen, Calendar, Clock, Eye } from "lucide-react"

interface ClassManagementProps {
  teacherId: string
}

export default function ClassManagement({ teacherId }: ClassManagementProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [classStudents, setClassStudents] = useState<Student[]>([])
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false)

  useEffect(() => {
    loadClasses()
  }, [teacherId])

  const loadClasses = () => {
    const teacherClasses = dataStore.getClassesByTeacher(teacherId)
    setClasses(teacherClasses)
  }

  const handleViewClass = (cls: Class) => {
    setSelectedClass(cls)
    // Get students enrolled in this class
    const students = cls.enrolledStudents
      .map((studentId) => dataStore.getStudentById(studentId))
      .filter(Boolean) as Student[]
    setClassStudents(students)
    setIsClassDetailOpen(true)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatSchedule = (schedule: Class["schedule"]) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return schedule.map((s) => `${days[s.dayOfWeek]} ${s.startTime}-${s.endTime}`).join(", ")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
        <p className="text-gray-600">Manage your classes and students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">
                  {classes.reduce((total, cls) => total + cls.enrolledStudents.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold">{classes.reduce((total, cls) => total + cls.schedule.length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>Classes you are currently teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classes.length > 0 ? (
              classes.map((cls) => {
                const subject = dataStore.getSubjectById(cls.subjectId)
                return (
                  <div key={cls.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{cls.name}</h3>
                          <Badge variant="secondary">{cls.academicYear}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{subject?.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {cls.enrolledStudents.length}/{cls.maxStudents} students
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Grade {cls.grade} - {cls.section}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{cls.schedule.length} sessions/week</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            <strong>Schedule:</strong> {formatSchedule(cls.schedule)}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button onClick={() => handleViewClass(cls)} variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No classes assigned</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Class Detail Dialog */}
      <Dialog open={isClassDetailOpen} onOpenChange={setIsClassDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
            <DialogDescription>
              {selectedClass && `${selectedClass.name} - ${selectedClass.academicYear}`}
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="space-y-6">
              {/* Class Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Class Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Subject:</span>{" "}
                      {dataStore.getSubjectById(selectedClass.subjectId)?.name}
                    </div>
                    <div>
                      <span className="font-medium">Grade & Section:</span> Grade {selectedClass.grade} -{" "}
                      {selectedClass.section}
                    </div>
                    <div>
                      <span className="font-medium">Capacity:</span> {selectedClass.enrolledStudents.length}/
                      {selectedClass.maxStudents}
                    </div>
                    <div>
                      <span className="font-medium">Academic Year:</span> {selectedClass.academicYear}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedClass.schedule.map((schedule, index) => {
                        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                        return (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{days[schedule.dayOfWeek]}</span>
                            <span>
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                            <span className="text-sm text-gray-500">{schedule.room}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Students List */}
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Students ({classStudents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-600 text-white text-xs">
                                  {getInitials(student.firstName, student.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{student.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{student.studentId}</TableCell>
                          <TableCell>{student.phone || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === "active" ? "default" : "secondary"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
