"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDFGenerator } from "@/lib/pdf-generator";
import { dataStore } from "@/lib/data-store";
import {
  FileText,
  Download,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
} from "lucide-react";

export default function ReportsManagement() {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  const students = dataStore.getStudents();
  const classes = dataStore.getClasses();
  const subjects = dataStore.getSubjects();

  const handleGenerateStudentTranscript = () => {
    if (selectedStudent) {
      PDFGenerator.generateStudentTranscript(selectedStudent);
    }
  };

  const handleGenerateClassList = () => {
    if (selectedClass) {
      PDFGenerator.generateClassList(selectedClass);
    }
  };

  const handleGenerateGradeReport = () => {
    if (selectedClass) {
      PDFGenerator.generateGradeReport(selectedClass);
    }
  };

  const handleGenerateSchoolReport = () => {
    PDFGenerator.generateSchoolReport();
  };

  // Helper function to format schedule object to string
  const formatSchedule = (schedule: any) => {
    if (!schedule || typeof schedule !== "object") {
      return "No schedule";
    }

    if (typeof schedule === "string") {
      return schedule;
    }

    const { dayOfWeek, startTime, endTime, room } = schedule;
    return `${dayOfWeek || ""} ${startTime || ""}-${endTime || ""} ${
      room ? `(${room})` : ""
    }`.trim();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Reports & PDF Generation</h2>
        <p className="text-muted-foreground">
          Generate and download various school reports in PDF format
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Student Reports
            </CardTitle>
            <CardDescription>
              Generate individual student transcripts and records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Student
              </label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} - Grade{" "}
                      {student.gradeLevel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerateStudentTranscript}
              disabled={!selectedStudent}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Generate Student Transcript
            </Button>
          </CardContent>
        </Card>

        {/* Class Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Class Reports
            </CardTitle>
            <CardDescription>
              Generate class lists and grade reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Class
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => {
                    const subject = subjects.find(
                      (s) => s.id === classItem.subjectId
                    );
                    return (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {subject?.name} - {formatSchedule(classItem.schedule)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleGenerateClassList}
                disabled={!selectedClass}
                className="w-full bg-transparent"
                variant="outline"
              >
                <Users className="mr-2 h-4 w-4" />
                Generate Class List
              </Button>
              <Button
                onClick={handleGenerateGradeReport}
                disabled={!selectedClass}
                className="w-full"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Grade Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* School Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              School Reports
            </CardTitle>
            <CardDescription>
              Generate comprehensive school overview reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateSchoolReport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Generate School Overview Report
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Report Statistics</CardTitle>
            <CardDescription>
              Overview of available data for reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Students Available</span>
                <span className="font-semibold">{students.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Classes Available</span>
                <span className="font-semibold">{classes.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">Subjects Available</span>
                <span className="font-semibold">{subjects.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
