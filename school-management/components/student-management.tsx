"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Student } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { Search, Plus, Eye, Edit, Trash2, GraduationCap } from "lucide-react"
import StudentForm from "@/components/student-form"
import StudentProfile from "@/components/student-profile"

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState<string>("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, selectedGrade])

  const loadStudents = () => {
    const allStudents = dataStore.getStudents()
    setStudents(allStudents)
  }

  const filterStudents = () => {
    let filtered = students

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by grade
    if (selectedGrade !== "all") {
      filtered = filtered.filter((student) => student.grade.toString() === selectedGrade)
    }

    setFilteredStudents(filtered)
  }

  const handleAddStudent = (studentData: Partial<Student>) => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      email: studentData.email!,
      password: "password123", // Default password
      role: "student",
      firstName: studentData.firstName!,
      lastName: studentData.lastName!,
      phone: studentData.phone,
      studentId: studentData.studentId!,
      grade: studentData.grade!,
      section: studentData.section!,
      dateOfBirth: studentData.dateOfBirth!,
      address: studentData.address!,
      enrollmentDate: new Date(),
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    dataStore.addStudent(newStudent)
    loadStudents()
    setIsAddDialogOpen(false)
  }

  const handleEditStudent = (studentData: Partial<Student>) => {
    if (selectedStudent) {
      dataStore.updateStudent(selectedStudent.id, studentData)
      loadStudents()
      setIsEditDialogOpen(false)
      setSelectedStudent(null)
    }
  }

  const handleDeleteStudent = (studentId: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      dataStore.deleteStudent(studentId)
      loadStudents()
    }
  }

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

  const uniqueGrades = Array.from(new Set(students.map((s) => s.grade))).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600">Manage student records and information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>Enter the student's information to create a new record.</DialogDescription>
            </DialogHeader>
            <StudentForm onSubmit={handleAddStudent} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-green-600 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{students.filter((s) => s.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-red-600 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold">{students.filter((s) => s.status === "inactive").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-blue-600 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-600">Graduated</p>
                <p className="text-2xl font-bold">{students.filter((s) => s.status === "graduated").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Grades</option>
                {uniqueGrades.map((grade) => (
                  <option key={grade} value={grade.toString()}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
          <CardDescription>A list of all students in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Grade & Section</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
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
                  <TableCell>
                    Grade {student.grade} - {student.section}
                  </TableCell>
                  <TableCell>{student.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(student.enrollmentDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student)
                          setIsProfileDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedStudent(student)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update the student's information.</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <StudentForm
              initialData={selectedStudent}
              onSubmit={handleEditStudent}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedStudent(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Student Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>Detailed information about the student</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <StudentProfile
              student={selectedStudent}
              onClose={() => {
                setIsProfileDialogOpen(false)
                setSelectedStudent(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
