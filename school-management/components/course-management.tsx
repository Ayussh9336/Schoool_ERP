"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Subject, Class, Teacher } from "@/lib/types"
import { dataStore } from "@/lib/data-store"
import { Search, Plus, BookOpen, Users, Calendar, Edit, Trash2, Eye } from "lucide-react"
import SubjectForm from "@/components/subject-form"
import ClassForm from "@/components/class-form"
import ClassDetails from "@/components/class-details"

export default function CourseManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("")
  const [classSearchTerm, setClassSearchTerm] = useState("")
  const [selectedGrade, setSelectedGrade] = useState<string>("all")
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false)
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false)
  const [isClassDetailsOpen, setIsClassDetailsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterSubjects()
  }, [subjects, subjectSearchTerm])

  useEffect(() => {
    filterClasses()
  }, [classes, classSearchTerm, selectedGrade])

  const loadData = () => {
    const allSubjects = dataStore.getSubjects()
    const allClasses = dataStore.getClasses()
    const allTeachers = dataStore.getTeachers()

    setSubjects(allSubjects)
    setClasses(allClasses)
    setTeachers(allTeachers)
  }

  const filterSubjects = () => {
    let filtered = subjects

    if (subjectSearchTerm) {
      filtered = filtered.filter(
        (subject) =>
          subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
          subject.department.toLowerCase().includes(subjectSearchTerm.toLowerCase()),
      )
    }

    setFilteredSubjects(filtered)
  }

  const filterClasses = () => {
    let filtered = classes

    if (classSearchTerm) {
      filtered = filtered.filter(
        (cls) =>
          cls.name.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
          cls.section.toLowerCase().includes(classSearchTerm.toLowerCase()),
      )
    }

    if (selectedGrade !== "all") {
      filtered = filtered.filter((cls) => cls.grade.toString() === selectedGrade)
    }

    setFilteredClasses(filtered)
  }

  const handleAddSubject = (subjectData: Partial<Subject>) => {
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name: subjectData.name!,
      code: subjectData.code!,
      description: subjectData.description!,
      credits: subjectData.credits!,
      department: subjectData.department!,
      grade: subjectData.grade!,
      isActive: true,
    }

    dataStore.addSubject(newSubject)
    loadData()
    setIsSubjectDialogOpen(false)
  }

  const handleEditSubject = (subjectData: Partial<Subject>) => {
    if (selectedSubject) {
      // In a real app, you'd have an updateSubject method
      loadData()
      setIsSubjectDialogOpen(false)
      setSelectedSubject(null)
      setIsEditMode(false)
    }
  }

  const handleAddClass = (classData: Partial<Class>) => {
    const newClass: Class = {
      id: `class-${Date.now()}`,
      name: classData.name!,
      grade: classData.grade!,
      section: classData.section!,
      teacherId: classData.teacherId!,
      subjectId: classData.subjectId!,
      schedule: classData.schedule!,
      maxStudents: classData.maxStudents!,
      enrolledStudents: [],
      academicYear: classData.academicYear!,
    }

    // In a real app, you'd have an addClass method in dataStore
    loadData()
    setIsClassDialogOpen(false)
  }

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      // In a real app, you'd have a deleteSubject method
      loadData()
    }
  }

  const handleDeleteClass = (classId: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      // In a real app, you'd have a deleteClass method
      loadData()
    }
  }

  const uniqueGrades = Array.from(new Set(classes.map((c) => c.grade))).sort()
  const uniqueDepartments = Array.from(new Set(subjects.map((s) => s.department)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <p className="text-gray-600">Manage subjects, classes, and course schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold">{uniqueDepartments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-orange-600 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollment</p>
                <p className="text-2xl font-bold">
                  {classes.reduce((total, cls) => total + cls.enrolledStudents.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Subjects and Classes */}
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search subjects by name, code, or department..."
                  value={subjectSearchTerm}
                  onChange={(e) => setSubjectSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? "Update the subject information." : "Create a new subject for the curriculum."}
                  </DialogDescription>
                </DialogHeader>
                <SubjectForm
                  initialData={isEditMode ? selectedSubject : undefined}
                  onSubmit={isEditMode ? handleEditSubject : handleAddSubject}
                  onCancel={() => {
                    setIsSubjectDialogOpen(false)
                    setSelectedSubject(null)
                    setIsEditMode(false)
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subjects ({filteredSubjects.length})</CardTitle>
              <CardDescription>Manage curriculum subjects and courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-gray-500">{subject.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{subject.code}</TableCell>
                      <TableCell>{subject.department}</TableCell>
                      <TableCell>Grade {subject.grade}</TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>
                        <Badge variant={subject.isActive ? "default" : "secondary"}>
                          {subject.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSubject(subject)
                              setIsEditMode(true)
                              setIsSubjectDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubject(subject.id)}
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
              {filteredSubjects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No subjects found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search classes by name or section..."
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
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
            <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>Set up a new class with schedule and teacher assignment.</DialogDescription>
                </DialogHeader>
                <ClassForm
                  subjects={subjects}
                  teachers={teachers}
                  onSubmit={handleAddClass}
                  onCancel={() => setIsClassDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Classes ({filteredClasses.length})</CardTitle>
              <CardDescription>Manage class sections and schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Grade & Section</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls) => {
                    const subject = dataStore.getSubjectById(cls.subjectId)
                    const teacher = dataStore.getTeacherById(cls.teacherId)
                    return (
                      <TableRow key={cls.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cls.name}</p>
                            <p className="text-sm text-gray-500">{cls.academicYear}</p>
                          </div>
                        </TableCell>
                        <TableCell>{subject?.name}</TableCell>
                        <TableCell>{teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unassigned"}</TableCell>
                        <TableCell>
                          Grade {cls.grade} - {cls.section}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>
                              {cls.enrolledStudents.length}/{cls.maxStudents}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(cls.enrolledStudents.length / cls.maxStudents) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{cls.schedule.length} sessions/week</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedClass(cls)
                                setIsClassDetailsOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClass(cls.id)}
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
              {filteredClasses.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No classes found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Class Details Dialog */}
      <Dialog open={isClassDetailsOpen} onOpenChange={setIsClassDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
            <DialogDescription>
              {selectedClass && `${selectedClass.name} - ${selectedClass.academicYear}`}
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <ClassDetails
              classData={selectedClass}
              onClose={() => {
                setIsClassDetailsOpen(false)
                setSelectedClass(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
