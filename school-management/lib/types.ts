// User Management Types 
export type UserRole = "admin" | "teacher" | "student" | "parent"

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Student extends User {
  gradeLevel: string   // ✅ fixed: now string to match mock-data
  role: "student"
  studentId: string
  grade: number
  section: string
  parentId?: string
  dateOfBirth: Date
  address: string
  enrollmentDate: Date
  status: "active" | "inactive" | "graduated"
}

export interface Teacher extends User {
  role: "teacher"
  teacherId: string
  department: string
  subjects: string[]
  qualification: string
  experience: number
  salary?: number
  joinDate: Date
}

export interface Admin extends User {
  role: "admin"
  adminId: string
  permissions: string[]
}

export interface Parent extends User {
  role: "parent"
  parentId: string
  children: string[] // Student IDs
  occupation?: string
}

// Academic Management Types
export interface Subject {
  id: string
  name: string
  code: string
  description: string
  credits: number
  department: string
  grade: number
  isActive: boolean
}

export interface Class {
  id: string
  name: string
  grade: number
  section: string
  teacherId: string
  subjectId: string
  schedule: ClassSchedule[]
  maxStudents: number
  enrolledStudents: string[] // Student IDs
  academicYear: string
  room?: string // ✅ added for pdf-generator
}

export interface ClassSchedule {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string
  endTime: string
  room: string
}

// Assessment Types
export interface Assignment {
  id: string
  title: string
  description: string
  subjectId: string
  teacherId: string
  classId: string
  dueDate: Date
  maxMarks: number
  type: "homework" | "quiz" | "exam" | "project"
  createdAt: Date
}

export interface Grade {
  id: string
  studentId: string
  assignmentId: string
  marksObtained: number
  maxMarks: number
  percentage: number
  grade: string // A+, A, B+, etc.
  feedback?: string
  submittedAt?: Date
  gradedAt: Date
  gradedBy: string // Teacher ID
}

// Attendance Types
export interface Attendance {
  id: string
  studentId: string
  classId: string
  date: Date
  status: "present" | "absent" | "late" | "excused"
  markedBy: string // Teacher ID
  notes?: string
}

// Enrollment Types
export interface Enrollment {
  id: string
  studentId: string
  classId: string
  enrollmentDate: Date
  status: "active" | "dropped" | "completed"
  finalGrade?: string
}

// Notification Types
export interface Notification {
  id: string
  recipientId: string
  recipientType: UserRole
  title: string
  message: string
  type: "announcement" | "grade" | "assignment" | "attendance" | "general"
  isRead: boolean
  createdAt: Date
  createdBy: string
}

// Dashboard Analytics Types
export interface StudentAnalytics {
  totalStudents: number
  activeStudents: number
  newEnrollments: number
  graduatedStudents: number
  attendanceRate: number
  averageGrade: number
}

export interface TeacherAnalytics {
  totalTeachers: number
  activeTeachers: number
  subjectsOffered: number
  averageClassSize: number
}

export interface AcademicAnalytics {
  totalClasses: number
  totalSubjects: number
  totalAssignments: number
  completionRate: number
}
