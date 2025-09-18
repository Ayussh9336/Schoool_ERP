import type {
  Student,
  Teacher,
  Admin,
  Subject,
  Class,
  Assignment,
  Grade,
  Attendance,
  Enrollment,
  Notification,
  User,
} from "./types"
import {
  mockStudents,
  mockTeachers,
  mockAdmins,
  mockSubjects,
  mockClasses,
  mockAssignments,
  mockGrades,
  mockNotifications,
} from "./mock-data"

// In-memory data store (in a real app, this would be a database)
class DataStore {
  private students: Student[] = [...mockStudents]
  private teachers: Teacher[] = [...mockTeachers]
  private admins: Admin[] = [...mockAdmins]
  private subjects: Subject[] = [...mockSubjects]
  private classes: Class[] = [...mockClasses]
  private assignments: Assignment[] = [...mockAssignments]
  private grades: Grade[] = [...mockGrades]
  private notifications: Notification[] = [...mockNotifications]
  private attendance: Attendance[] = []
  private enrollments: Enrollment[] = []

  // User Management
  getAllUsers(): User[] {
    return [...this.students, ...this.teachers, ...this.admins]
  }

  getUserById(id: string): User | undefined {
    return this.getAllUsers().find((user) => user.id === id)
  }

  getUserByEmail(email: string): User | undefined {
    return this.getAllUsers().find((user) => user.email === email)
  }

  authenticateUser(email: string, password: string): User | null {
    const user = this.getUserByEmail(email)
    if (user && user.password === password) {
      return user
    }
    return null
  }

  // Student Management
  getStudents(): Student[] {
    return [...this.students]
  }

  getStudentById(id: string): Student | undefined {
    return this.students.find((student) => student.id === id)
  }

  addStudent(student: Student): void {
    this.students.push(student)
  }

  updateStudent(id: string, updates: Partial<Student>): Student | null {
    const index = this.students.findIndex((student) => student.id === id)
    if (index !== -1) {
      this.students[index] = { ...this.students[index], ...updates, updatedAt: new Date() }
      return this.students[index]
    }
    return null
  }

  deleteStudent(id: string): boolean {
    const index = this.students.findIndex((student) => student.id === id)
    if (index !== -1) {
      this.students.splice(index, 1)
      return true
    }
    return false
  }

  // Teacher Management
  getTeachers(): Teacher[] {
    return [...this.teachers]
  }

  getTeacherById(id: string): Teacher | undefined {
    return this.teachers.find((teacher) => teacher.id === id)
  }

  addTeacher(teacher: Teacher): void {
    this.teachers.push(teacher)
  }

  updateTeacher(id: string, updates: Partial<Teacher>): Teacher | null {
    const index = this.teachers.findIndex((teacher) => teacher.id === id)
    if (index !== -1) {
      this.teachers[index] = { ...this.teachers[index], ...updates, updatedAt: new Date() }
      return this.teachers[index]
    }
    return null
  }

  // Subject Management
  getSubjects(): Subject[] {
    return [...this.subjects]
  }

  getSubjectById(id: string): Subject | undefined {
    return this.subjects.find((subject) => subject.id === id)
  }

  addSubject(subject: Subject): void {
    this.subjects.push(subject)
  }

  // Class Management
  getClasses(): Class[] {
    return [...this.classes]
  }

  getClassById(id: string): Class | undefined {
    return this.classes.find((cls) => cls.id === id)
  }

  getClassesByTeacher(teacherId: string): Class[] {
    return this.classes.filter((cls) => cls.teacherId === teacherId)
  }

  getClassesByStudent(studentId: string): Class[] {
    return this.classes.filter((cls) => cls.enrolledStudents.includes(studentId))
  }

  // Assignment Management
  getAssignments(): Assignment[] {
    return [...this.assignments]
  }

  getAssignmentById(id: string): Assignment | undefined {
    return this.assignments.find((assignment) => assignment.id === id)
  }

  getAssignmentsByClass(classId: string): Assignment[] {
    return this.assignments.filter((assignment) => assignment.classId === classId)
  }

  getAssignmentsByTeacher(teacherId: string): Assignment[] {
    return this.assignments.filter((assignment) => assignment.teacherId === teacherId)
  }

  addAssignment(assignment: Assignment): void {
    this.assignments.push(assignment)
  }

  // Grade Management
  getGrades(): Grade[] {
    return [...this.grades]
  }

  getGradesByStudent(studentId: string): Grade[] {
    return this.grades.filter((grade) => grade.studentId === studentId)
  }

  getGradesByAssignment(assignmentId: string): Grade[] {
    return this.grades.filter((grade) => grade.assignmentId === assignmentId)
  }

  addGrade(grade: Grade): void {
    this.grades.push(grade)
  }

  updateGrade(id: string, updates: Partial<Grade>): Grade | null {
    const index = this.grades.findIndex((grade) => grade.id === id)
    if (index !== -1) {
      this.grades[index] = { ...this.grades[index], ...updates }
      return this.grades[index]
    }
    return null
  }

  // Notification Management
  getNotifications(): Notification[] {
    return [...this.notifications]
  }

  getNotificationsByUser(userId: string): Notification[] {
    return this.notifications.filter((notif) => notif.recipientId === userId)
  }

  addNotification(notification: Notification): void {
    this.notifications.push(notification)
  }

  markNotificationAsRead(id: string): void {
    const notification = this.notifications.find((notif) => notif.id === id)
    if (notification) {
      notification.isRead = true
    }
  }
}

// Export singleton instance
export const dataStore = new DataStore()
