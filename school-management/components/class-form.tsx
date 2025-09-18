"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Subject, Teacher, Class } from "@/lib/types"

interface ClassFormProps {
  subjects: Subject[]
  teachers: Teacher[]
  onSubmit: (data: Partial<Class>) => void
  onCancel: () => void
}

export default function ClassForm({ subjects, teachers, onSubmit, onCancel }: ClassFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    grade: 9,
    section: "A",
    subjectId: "",
    teacherId: "",
    maxStudents: 30,
    academicYear: "2023-2024",
    schedule: [{ dayOfWeek: 1, startTime: "09:00", endTime: "10:00", room: "" }],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      schedule: formData.schedule.filter((s) => s.room.trim() !== ""),
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "grade" || name === "maxStudents" ? Number.parseInt(value) : value,
    }))
  }

  const handleScheduleChange = (index: number, field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item, i) =>
        i === index ? { ...item, [field]: field === "dayOfWeek" ? Number.parseInt(value as string) : value } : item,
      ),
    }))
  }

  const addScheduleSlot = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { dayOfWeek: 1, startTime: "09:00", endTime: "10:00", room: "" }],
    }))
  }

  const removeScheduleSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }))
  }

  const days = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ]

  const sections = ["A", "B", "C", "D", "E"]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Class Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Mathematics - Grade 10A"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="academicYear">Academic Year</Label>
          <Input
            id="academicYear"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            placeholder="e.g., 2023-2024"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <select
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <select
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {sections.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxStudents">Max Students</Label>
          <Input
            id="maxStudents"
            name="maxStudents"
            type="number"
            value={formData.maxStudents}
            onChange={handleChange}
            min="1"
            max="50"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subjectId">Subject</Label>
          <select
            id="subjectId"
            name="subjectId"
            value={formData.subjectId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Subject</option>
            {subjects
              .filter((subject) => subject.grade === formData.grade)
              .map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="teacherId">Teacher</Label>
          <select
            id="teacherId"
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName} ({teacher.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Class Schedule</Label>
          <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
            Add Time Slot
          </Button>
        </div>

        {formData.schedule.map((slot, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-sm">Day</Label>
              <select
                value={slot.dayOfWeek}
                onChange={(e) => handleScheduleChange(index, "dayOfWeek", e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {days.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Start Time</Label>
              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                className="text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">End Time</Label>
              <Input
                type="time"
                value={slot.endTime}
                onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                className="text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Room</Label>
              <Input
                value={slot.room}
                onChange={(e) => handleScheduleChange(index, "room", e.target.value)}
                placeholder="Room 101"
                className="text-sm"
                required
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeScheduleSlot(index)}
              className="text-red-600 hover:text-red-700"
              disabled={formData.schedule.length === 1}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Class</Button>
      </div>
    </form>
  )
}
