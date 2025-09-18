"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { Assignment, Class } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { Plus, Calendar, BookOpen, Users, Edit, Trash2 } from "lucide-react"

interface AssignmentManagementProps {
  teacherId: string
  onDataChange?: () => void
}

export default function AssignmentManagement({ teacherId, onDataChange }: AssignmentManagementProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [teacherId])

  const loadData = () => {
    const teacherAssignments = dataStore.getAssignmentsByTeacher(teacherId)
    setAssignments(teacherAssignments)

    const teacherClasses = dataStore.getClassesByTeacher(teacherId)
    setClasses(teacherClasses)
  }

  const handleCreateAssignment = (assignmentData: Partial<Assignment>) => {
    const newAssignment: Assignment = {
      id: `assignment-${Date.now()}`,
      title: assignmentData.title!,
      description: assignmentData.description!,
      subjectId: assignmentData.subjectId!,
      teacherId: teacherId,
      classId: assignmentData.classId!,
      dueDate: assignmentData.dueDate!,
      maxMarks: assignmentData.maxMarks!,
      type: assignmentData.type!,
      createdAt: new Date(),
    }

    dataStore.addAssignment(newAssignment)
    loadData()
    onDataChange?.()
    setIsCreateDialogOpen(false)
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      // In a real app, you'd have a delete method in dataStore
      loadData()
      onDataChange?.()
    }
  }

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "destructive"
      case "quiz":
        return "secondary"
      case "project":
        return "default"
      default:
        return "outline"
    }
  }

  const getSubmissionStats = (assignmentId: string) => {
    const grades = dataStore.getGradesByAssignment(assignmentId)
    const assignment = assignments.find((a) => a.id === assignmentId)
    const cls = assignment ? dataStore.getClassById(assignment.classId) : null
    const totalStudents = cls?.enrolledStudents.length || 0

    return {
      submitted: grades.length,
      total: totalStudents,
      graded: grades.filter((g) => g.gradedAt).length,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignment Management</h2>
          <p className="text-gray-600">Create and manage assignments for your classes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>Create a new assignment for your students.</DialogDescription>
            </DialogHeader>
            <AssignmentForm
              classes={classes}
              onSubmit={handleCreateAssignment}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Due This Week</p>
                <p className="text-2xl font-bold">
                  {
                    assignments.filter((a) => {
                      const dueDate = new Date(a.dueDate)
                      const now = new Date()
                      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                      return dueDate >= now && dueDate <= weekFromNow
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Grades</p>
                <p className="text-2xl font-bold">
                  {assignments.reduce((total, assignment) => {
                    const stats = getSubmissionStats(assignment.id)
                    return total + (stats.submitted - stats.graded)
                  }, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-red-600 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-600">Exams</p>
                <p className="text-2xl font-bold">{assignments.filter((a) => a.type === "exam").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Assignments</CardTitle>
          <CardDescription>All assignments you have created</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                const cls = dataStore.getClassById(assignment.classId)
                const subject = dataStore.getSubjectById(assignment.subjectId)
                const stats = getSubmissionStats(assignment.id)

                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-gray-500">{subject?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{cls?.name}</TableCell>
                    <TableCell>
                      <Badge variant={getAssignmentTypeColor(assignment.type)}>{assignment.type}</Badge>
                    </TableCell>
                    <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{assignment.maxMarks}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>
                          {stats.submitted}/{stats.total} submitted
                        </p>
                        <p className="text-gray-500">{stats.graded} graded</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {assignments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No assignments created yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface AssignmentFormProps {
  classes: Class[]
  initialData?: Assignment
  onSubmit: (data: Partial<Assignment>) => void
  onCancel: () => void
}

function AssignmentForm({ classes, initialData, onSubmit, onCancel }: AssignmentFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    classId: initialData?.classId || "",
    subjectId: initialData?.subjectId || "",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split("T")[0] : "",
    maxMarks: initialData?.maxMarks || 100,
    type: initialData?.type || ("homework" as Assignment["type"]),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedClass = classes.find((c) => c.id === formData.classId)
    onSubmit({
      ...formData,
      subjectId: selectedClass?.subjectId || formData.subjectId,
      dueDate: new Date(formData.dueDate),
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxMarks" ? Number.parseInt(value) : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Assignment Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="classId">Class</Label>
          <select
            id="classId"
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Assignment Type</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="homework">Homework</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} required />
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
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update Assignment" : "Create Assignment"}</Button>
      </div>
    </form>
  )
}
