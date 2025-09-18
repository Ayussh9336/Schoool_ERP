import jsPDF from "jspdf"
import "jspdf-autotable"
import { dataStore } from "./data-store"
import { Student, Grade, Class } from "./types"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export class PDFGenerator {
  private static addHeader(doc: jsPDF, title: string) {
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("School Management System", 20, 20)

    doc.setFontSize(16)
    doc.setFont("helvetica", "normal")
    doc.text(title, 20, 35)

    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)

    return 55 // Return Y position for content
  }

  static generateStudentTranscript(studentId: string): void {
    const student = dataStore.getStudentById(studentId) as Student | undefined
    if (!student) return

    const doc = new jsPDF()
    let yPos = this.addHeader(doc, `Student Transcript - ${student.firstName} ${student.lastName}`)

    // Student Information
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Student Information", 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Name: ${student.firstName} ${student.lastName}`, 20, yPos)
    doc.text(`Student ID: ${student.studentId}`, 20, yPos + 8)
    doc.text(`Email: ${student.email}`, 20, yPos + 16)
    doc.text(`Grade Level: ${student.gradeLevel}`, 20, yPos + 24)
    doc.text(`Enrollment Date: ${student.enrollmentDate.toDateString()}`, 20, yPos + 32)
    yPos += 50

    // Grades
    const grades: Grade[] = dataStore.getGradesByStudent(studentId)
    if (grades.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Academic Record", 20, yPos)
      yPos += 10

      const gradeData = grades.map((grade: Grade) => {
        const assignment = dataStore.getAssignmentById(grade.assignmentId)
        const subject = assignment ? dataStore.getSubjectById(assignment.subjectId) : null
        return [
          subject?.name || "Unknown",
          assignment?.title || "Unknown",
          grade.marksObtained.toString(),
          grade.grade,
          new Date(grade.gradedAt).toLocaleDateString(),
        ]
      })

      doc.autoTable({
        startY: yPos,
        head: [["Subject", "Assignment", "Score", "Grade", "Date"]],
        body: gradeData,
        theme: "grid",
        styles: { fontSize: 9 },
      })
    }

    doc.save(`${student.firstName}_${student.lastName}_Transcript.pdf`)
  }

  static generateClassList(classId: string): void {
    const classData = dataStore.getClassById(classId) as Class | undefined
    if (!classData) return

    const subject = dataStore.getSubjectById(classData.subjectId)
    const teacher = dataStore.getTeacherById(classData.teacherId)

    const doc = new jsPDF()
    let yPos = this.addHeader(doc, `Class List - ${subject?.name || "Unknown Subject"}`)

    // Class Information
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Class Information", 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Subject: ${subject?.name || "Unknown"}`, 20, yPos)
    doc.text(`Teacher: ${teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown"}`, 20, yPos + 8)
    doc.text(`Schedule: ${JSON.stringify(classData.schedule)}`, 20, yPos + 16)
    doc.text(`Room: ${classData.room || "N/A"}`, 20, yPos + 24)
    yPos += 40

    // Student List
    const students: Student[] = classData.enrolledStudents
      .map((id: string) => dataStore.getStudentById(id) as Student | undefined)
      .filter((s): s is Student => Boolean(s))

    if (students.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Enrolled Students", 20, yPos)
      yPos += 10

      const studentData = students.map((student: Student, index: number) => [
        (index + 1).toString(),
        `${student.firstName} ${student.lastName}`,
        student.email,
        student.gradeLevel.toString(),
      ])

      doc.autoTable({
        startY: yPos,
        head: [["#", "Name", "Email", "Grade Level"]],
        body: studentData,
        theme: "grid",
        styles: { fontSize: 9 },
      })
    }

    doc.save(`${subject?.name || "Class"}_List.pdf`)
  }

  static generateGradeReport(classId: string): void {
    const classData = dataStore.getClassById(classId) as Class | undefined
    if (!classData) return

    const subject = dataStore.getSubjectById(classData.subjectId)
    const teacher = dataStore.getTeacherById(classData.teacherId)

    const doc = new jsPDF()
    let yPos = this.addHeader(doc, `Grade Report - ${subject?.name || "Unknown Subject"}`)

    // Class Information
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Class Information", 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Subject: ${subject?.name || "Unknown"}`, 20, yPos)
    doc.text(`Teacher: ${teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown"}`, 20, yPos + 8)
    yPos += 25

    // Grade Summary
    const students: Student[] = classData.enrolledStudents
      .map((id: string) => dataStore.getStudentById(id) as Student | undefined)
      .filter((s): s is Student => Boolean(s))

    const gradeData = students.map((student: Student) => {
      const grades: Grade[] = dataStore.getGradesByStudent(student.id)
      const classGrades = grades.filter((grade: Grade) => {
        const assignment = dataStore.getAssignmentById(grade.assignmentId)
        return assignment?.subjectId === classData.subjectId
      })

      const avgScore =
        classGrades.length > 0
          ? classGrades.reduce((sum: number, grade: Grade) => sum + grade.marksObtained, 0) / classGrades.length
          : 0

      return [
        `${student.firstName} ${student.lastName}`,
        classGrades.length.toString(),
        avgScore.toFixed(1),
        avgScore >= 90 ? "A" : avgScore >= 80 ? "B" : avgScore >= 70 ? "C" : avgScore >= 60 ? "D" : "F",
      ]
    })

    if (gradeData.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [["Student Name", "Assignments", "Average Score", "Letter Grade"]],
        body: gradeData,
        theme: "grid",
        styles: { fontSize: 9 },
      })
    }

    doc.save(`${subject?.name || "Class"}_Grade_Report.pdf`)
  }

  static generateSchoolReport(): void {
    const doc = new jsPDF()
    let yPos = this.addHeader(doc, "School Overview Report")

    const students: Student[] = dataStore.getStudents()
    const teachers = dataStore.getTeachers()
    const classes = dataStore.getClasses()
    const subjects = dataStore.getSubjects()

    // Summary Statistics
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("School Statistics", 20, yPos)
    yPos += 15

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Total Students: ${students.length}`, 20, yPos)
    doc.text(`Total Teachers: ${teachers.length}`, 20, yPos + 8)
    doc.text(`Total Classes: ${classes.length}`, 20, yPos + 16)
    doc.text(`Total Subjects: ${subjects.length}`, 20, yPos + 24)
    yPos += 40

    // Grade Level Distribution
    const gradeLevels = students.reduce((acc: Record<number, number>, student: Student) => {
      acc[student.gradeLevel] = (acc[student.gradeLevel] || 0) + 1
      return acc
    }, {})

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Student Distribution by Grade Level", 20, yPos)
    yPos += 10

    const gradeData = Object.entries(gradeLevels).map(([grade, count]) => [
      `Grade ${grade}`,
      count.toString(),
      `${((count / students.length) * 100).toFixed(1)}%`,
    ])

    doc.autoTable({
      startY: yPos,
      head: [["Grade Level", "Students", "Percentage"]],
      body: gradeData,
      theme: "grid",
      styles: { fontSize: 9 },
    })

    doc.save("School_Overview_Report.pdf")
  }
}
