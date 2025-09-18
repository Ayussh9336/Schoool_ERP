"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Class, Student, Teacher, Subject } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { Users, Calendar, BookOpen, Clock } from "lucide-react"

interface ClassDetailsProps {
  classData: Class
  onClose: () => void
}

export default function ClassDetails({ classData, onClose }: ClassDetailsProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)

  useEffect(() => {
    // Get enrolled students
    const enrolledStudents = classData.enrolledStudents
      .map((studentId) => dataStore.getStudentById(studentId))
      .filter(Boolean) as Student[]
    setStudents(enrolledStudents)

    // Get teacher
    const classTeacher = dataStore.getTeacherById(classData.teacherId)
    setTeacher(classTeacher)

    // Get subject
    const classSubject = dataStore.getSubjectById(classData.subjectId)
    setSubject(classSubject)
  }, [classData])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatSchedule = (schedule: Class["schedule"]) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return schedule.map((s) => ({
      ...s,
      dayName: days[s.dayOfWeek],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Class Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{classData.name}</p>
                <p className="text-sm text-gray-500">{subject?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">
                  Grade {classData.grade} - Section {classData.section}
                </p>
                <p className="text-sm text-gray-500">
                  {students.length}/{classData.maxStudents} students enrolled
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">Academic Year</p>
                <p className="text-sm text-gray-500">{classData.academicYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Teacher Information</CardTitle>
          </CardHeader>
          <CardContent>
            {teacher ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(teacher.firstName, teacher.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {teacher.firstName} {teacher.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{teacher.department}</p>
                  <p className="text-sm text-gray-500">{teacher.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No teacher assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Class Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {formatSchedule(classData.schedule).map((schedule, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{schedule.dayName}</p>
                    <p className="text-sm text-gray-500">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                  </div>
                  <Badge variant="outline">{schedule.room}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Students */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students ({students.length})</CardTitle>
          <CardDescription>Students currently enrolled in this class</CardDescription>
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
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-600 text-white text-xs">
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
                    <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {students.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No students enrolled in this class yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
