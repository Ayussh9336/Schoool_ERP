"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dataStore } from "@/lib/data-store"
import type { Grade, Student } from "@/lib/types"
import { BarChart3, TrendingUp, Users, Award } from "lucide-react"

interface GradeAnalyticsProps {
  teacherId?: string
  studentId?: string
  classId?: string
}

export default function GradeAnalytics({ teacherId, studentId, classId }: GradeAnalyticsProps) {
  const [analytics, setAnalytics] = useState({
    totalGrades: 0,
    averageGrade: 0,
    gradeDistribution: {} as Record<string, number>,
    subjectPerformance: [] as Array<{ subject: string; average: number; count: number }>,
    recentTrends: [] as Array<{ date: string; average: number }>,
    topPerformers: [] as Array<{ student: Student; average: number }>,
    improvementNeeded: [] as Array<{ student: Student; average: number }>,
  })

  useEffect(() => {
    calculateAnalytics()
  }, [teacherId, studentId, classId])

  const calculateAnalytics = () => {
    let grades: Grade[] = []

    if (studentId) {
      grades = dataStore.getGradesByStudentID(studentId)
    } else if (teacherId) {
      const assignments = dataStore.getAssignmentsByTeacher(teacherId)
      grades = assignments.flatMap((assignment) => dataStore.getGradesByAssignment(assignment.id))
    } else if (classId) {
      const classData = dataStore.getClassById(classId)
      if (classData) {
        const assignments = dataStore.getAssignments().filter((a) => a.classId === classId)
        grades = assignments.flatMap((assignment) => dataStore.getGradesByAssignment(assignment.id))
      }
    } else {
      grades = dataStore.getGrades()
    }

    // Calculate basic stats
    const totalGrades = grades.length
    const averageGrade = totalGrades > 0 ? grades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades : 0

    // Grade distribution
    const gradeDistribution = grades.reduce(
      (acc, grade) => {
        acc[grade.grade] = (acc[grade.grade] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Subject performance
    const subjectGrades = grades.reduce(
      (acc, grade) => {
        const assignment = dataStore.getAssignmentById(grade.assignmentId)
        if (assignment) {
          const subject = dataStore.getSubjectById(assignment.subjectId)
          if (subject) {
            if (!acc[subject.name]) {
              acc[subject.name] = []
            }
            acc[subject.name].push(grade.percentage)
          }
        }
        return acc
      },
      {} as Record<string, number[]>,
    )

    const subjectPerformance = Object.entries(subjectGrades)
      .map(([subject, percentages]) => ({
        subject,
        average: percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
        count: percentages.length,
      }))
      .sort((a, b) => b.average - a.average)

    // Recent trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentGrades = grades
      .filter((grade) => new Date(grade.gradedAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.gradedAt).getTime() - new Date(b.gradedAt).getTime())

    const recentTrends = recentGrades.reduce(
      (acc, grade) => {
        const date = new Date(grade.gradedAt).toISOString().split("T")[0]
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(grade.percentage)
        return acc
      },
      {} as Record<string, number[]>,
    )

    const trendsArray = Object.entries(recentTrends).map(([date, percentages]) => ({
      date,
      average: percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
    }))

    // Top performers and improvement needed (if not student-specific)
    let topPerformers: Array<{ student: Student; average: number }> = []
    let improvementNeeded: Array<{ student: Student; average: number }> = []

    if (!studentId) {
      const studentAverages = grades.reduce(
        (acc, grade) => {
          if (!acc[grade.studentId]) {
            acc[grade.studentId] = []
          }
          acc[grade.studentId].push(grade.percentage)
          return acc
        },
        {} as Record<string, number[]>,
      )

      const studentPerformance = Object.entries(studentAverages)
        .map(([studentId, percentages]) => {
          const student = dataStore.getStudentById(studentId)
          const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
          return { student: student!, average }
        })
        .filter((item) => item.student)

      topPerformers = studentPerformance.sort((a, b) => b.average - a.average).slice(0, 5)

      improvementNeeded = studentPerformance
        .filter((item) => item.average < 70)
        .sort((a, b) => a.average - b.average)
        .slice(0, 5)
    }

    setAnalytics({
      totalGrades,
      averageGrade,
      gradeDistribution,
      subjectPerformance,
      recentTrends: trendsArray,
      topPerformers,
      improvementNeeded,
    })
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600 bg-green-50"
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-50"
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getPerformanceColor = (average: number) => {
    if (average >= 90) return "text-green-600"
    if (average >= 80) return "text-blue-600"
    if (average >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Grade Analytics</h2>
        <p className="text-muted-foreground">Comprehensive analysis of academic performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGrades}</div>
            <p className="text-xs text-muted-foreground">Recorded grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(analytics.averageGrade)}`}>
              {analytics.averageGrade.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Object.keys(analytics.gradeDistribution).sort().reverse()[0] || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Highest achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.subjectPerformance.length}</div>
            <p className="text-xs text-muted-foreground">Tracked subjects</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Grade Distribution</TabsTrigger>
          <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
          {!studentId && <TabsTrigger value="students">Student Performance</TabsTrigger>}
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>Breakdown of grades across all assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.gradeDistribution)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([grade, count]) => {
                    const percentage = (count / analytics.totalGrades) * 100
                    return (
                      <div key={grade} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getGradeColor(grade)}>{grade}</Badge>
                          <span className="text-sm">{count} students</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm text-muted-foreground w-12">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Average performance across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.subjectPerformance.map((subject, index) => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{subject.subject}</h4>
                        <p className="text-sm text-muted-foreground">{subject.count} assessments</p>
                      </div>
                      <div className={`text-lg font-bold ${getPerformanceColor(subject.average)}`}>
                        {subject.average.toFixed(1)}%
                      </div>
                    </div>
                    <Progress value={subject.average} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {!studentId && (
          <TabsContent value="students" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Students with highest average grades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topPerformers.map((performer, index) => (
                      <div
                        key={performer.student.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-green-50"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">
                              {performer.student.firstName} {performer.student.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">Grade {performer.student.gradeLevel}</p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600">{performer.average.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Needs Improvement</CardTitle>
                  <CardDescription>Students who may need additional support</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.improvementNeeded.map((student, index) => (
                      <div
                        key={student.student.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-red-50"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                            !
                          </div>
                          <div>
                            <p className="font-medium">
                              {student.student.firstName} {student.student.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">Grade {student.student.gradeLevel}</p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-red-600">{student.average.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
