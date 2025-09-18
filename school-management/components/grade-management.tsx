"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Assignment, Grade, Student } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { BookOpen, Edit } from "lucide-react"

interface GradeManagementProps {
  teacherId: string
}

export default function GradeManagement({ teacherId }: GradeManagementProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [assignmentGrades, setAssignmentGrades] = useState<Grade[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)

  useEffect(() => {
    loadAssignments()
  }, [teacherId])

  const loadAssignments = () => {
    const teacherAssignments = dataStore.getAssignmentsByTeacher(teacherId)
    setAssignments(teacherAssignments)
  }

  const handleSelectAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)

    // Get grades for this assignment
    const grades = dataStore.getGradesByAssignment(assignment.id)
    setAssignmentGrades(grades)

    // Get students in the class
    const cls = dataStore.getClassById(assignment.classId)
    if (cls) {
      const classStudents = cls.enrolledStudents
        .map((studentId) => dataStore.getStudentById(studentId))
        .filter(Boolean) as Student[]
      setStudents(classStudents)
    }
  }

  const handleGradeSubmission = (gradeData: Partial<Grade>) => {
    if (selectedGrade) {
      // Update existing grade
      dataStore.updateGrade(selectedGrade.id, {
        ...gradeData,
        percentage: Math.round((gradeData.marksObtained! / gradeData.maxMarks!) * 100),
        grade: calculateLetterGrade(gradeData.marksObtained!, gradeData.maxMarks!),
        gradedAt: new Date(),
        gradedBy: teacherId,
      })
    } else if (selectedAssignment) {
      // Create new grade
      const newGrade: Grade = {
        id: `grade-${Date.now()}`,
        studentId: gradeData.studentId!,
        assignmentId: selectedAssignment.id,
        marksObtained: gradeData.marksObtained!,
        maxMarks: gradeData.maxMarks!,
        percentage: Math.round((gradeData.marksObtained! / gradeData.maxMarks!) * 100),
        grade: calculateLetterGrade(gradeData.marksObtained!, gradeData.maxMarks!),
        feedback: gradeData.feedback,
        gradedAt: new Date(),
        gradedBy: teacherId,
      }
      dataStore.addGrade(newGrade)
    }

    // Refresh data
    if (selectedAssignment) {
      handleSelectAssignment(selectedAssignment)
    }
    setIsGradeDialogOpen(false)
    setSelectedGrade(null)
  }

  const calculateLetterGrade = (obtained: number, max: number): string => {
    const percentage = (obtained / max) * 100
    if (percentage >= 90) return "A+"
    if (percentage >= 85) return "A"
    if (percentage >= 80) return "A-"
    if (percentage >= 75) return "B+"
    if (percentage >= 70) return "B"
    if (percentage >= 65) return "B-"
    if (percentage >= 60) return "C+"
    if (percentage >= 55) return "C"
    if (percentage >= 50) return "C-"
    return "F"
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600"
    if (grade.startsWith("B")) return "text-blue-600"
    if (grade.startsWith("C")) return "text-yellow-600"
    return "text-red-600"
  }

  const getAssignmentStats = () => {
    if (!selectedAssignment) return { submitted: 0, total: 0, avgGrade: 0 }

    const cls = dataStore.getClassById(selectedAssignment.classId)
    const total = cls?.enrolledStudents.length || 0
    const submitted = assignmentGrades.length
    const avgGrade =
      submitted > 0 ? Math.round(assignmentGrades.reduce((sum, g) => sum + g.percentage, 0) / submitted) : 0

    return { submitted, total, avgGrade }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Grade Management</h2>
        <p className="text-gray-600">Grade student assignments and track performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Assignment</CardTitle>
            <CardDescription>Choose an assignment to grade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignments.map((assignment) => {
                const subject = dataStore.getSubjectById(assignment.subjectId)
                const cls = dataStore.getClassById(assignment.classId)
                const grades = dataStore.getGradesByAssignment(assignment.id)
                const totalStudents = cls?.enrolledStudents.length || 0

                return (
                  <button
                    key={assignment.id}
                    onClick={() => handleSelectAssignment(assignment)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      selectedAssignment?.id === assignment.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-gray-500">{subject?.name}</p>
                        <p className="text-sm text-gray-500">{cls?.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={assignment.type === "exam" ? "destructive" : "secondary"}>
                          {assignment.type}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {grades.length}/{totalStudents} graded
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
              {assignments.length === 0 && <p className="text-gray-500 text-center py-4">No assignments found</p>}
            </div>
          </CardContent>
        </Card>

        {/* Grading Interface */}
        <div className="lg:col-span-2">
          {selectedAssignment ? (
            <div className="space-y-6">
              {/* Assignment Info & Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedAssignment.title}</CardTitle>
                  <CardDescription>
                    {dataStore.getSubjectById(selectedAssignment.subjectId)?.name} • Due:{" "}
                    {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{getAssignmentStats().submitted}</div>
                      <p className="text-sm text-gray-500">Submitted</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{getAssignmentStats().total}</div>
                      <p className="text-sm text-gray-500">Total Students</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{getAssignmentStats().avgGrade}%</div>
                      <p className="text-sm text-gray-500">Average Grade</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Students Grading Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Submissions</CardTitle>
                  <CardDescription>Grade student submissions for this assignment</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const grade = assignmentGrades.find((g) => g.studentId === student.id)

                        return (
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
                                  <p className="text-sm text-gray-500">{student.studentId}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {grade ? (
                                <span className={`font-bold ${getGradeColor(grade.grade)}`}>{grade.grade}</span>
                              ) : (
                                <span className="text-gray-400">Not graded</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {grade ? <span>{grade.percentage}%</span> : <span className="text-gray-400">-</span>}
                            </TableCell>
                            <TableCell>
                              {grade?.feedback ? (
                                <span className="text-sm">{grade.feedback.substring(0, 50)}...</span>
                              ) : (
                                <span className="text-gray-400">No feedback</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedGrade(grade || null)
                                  setIsGradeDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select an assignment to start grading</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedGrade ? "Edit Grade" : "Add Grade"}</DialogTitle>
            <DialogDescription>{selectedAssignment && `Grading: ${selectedAssignment.title}`}</DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <GradeForm
              assignment={selectedAssignment}
              initialGrade={selectedGrade}
              students={students}
              onSubmit={handleGradeSubmission}
              onCancel={() => {
                setIsGradeDialogOpen(false)
                setSelectedGrade(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface GradeFormProps {
  assignment: Assignment
  initialGrade?: Grade | null
  students: Student[]
  onSubmit: (data: Partial<Grade>) => void
  onCancel: () => void
}

function GradeForm({ assignment, initialGrade, students, onSubmit, onCancel }: GradeFormProps) {
  const [formData, setFormData] = useState({
    studentId: initialGrade?.studentId || "",
    marksObtained: initialGrade?.marksObtained || 0,
    maxMarks: initialGrade?.maxMarks || assignment.maxMarks,
    feedback: initialGrade?.feedback || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "marksObtained" || name === "maxMarks" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const selectedStudent = students.find((s) => s.id === formData.studentId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initialGrade && (
        <div className="space-y-2">
          <Label htmlFor="studentId">Student</Label>
          <select
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName} ({student.studentId})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedStudent && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium">
            {selectedStudent.firstName} {selectedStudent.lastName}
          </p>
          <p className="text-sm text-gray-500">Student ID: {selectedStudent.studentId}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marksObtained">Marks Obtained</Label>
          <Input
            id="marksObtained"
            name="marksObtained"
            type="number"
            value={formData.marksObtained}
            onChange={handleChange}
            min="0"
            max={formData.maxMarks}
            step="0.5"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxMarks">Maximum Marks</Label>
          <Input
            id="maxMarks"
            name="maxMarks"
            type="number"
            value={formData.maxMarks}
            onChange={handleChange}
            min="1"
            step="0.5"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback (Optional)</Label>
        <Textarea
          id="feedback"
          name="feedback"
          value={formData.feedback}
          onChange={handleChange}
          rows={3}
          placeholder="Provide feedback for the student..."
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialGrade ? "Update Grade" : "Add Grade"}</Button>
      </div>
    </form>
  )
}
