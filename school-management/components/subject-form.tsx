"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Subject } from "@/lib/types"

interface SubjectFormProps {
  initialData?: Subject
  onSubmit: (data: Partial<Subject>) => void
  onCancel: () => void
}

export default function SubjectForm({ initialData, onSubmit, onCancel }: SubjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    description: initialData?.description || "",
    credits: initialData?.credits || 3,
    department: initialData?.department || "",
    grade: initialData?.grade || 9,
    isActive: initialData?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? Number.parseInt(value)
          : type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
    }))
  }

  const departments = [
    "Mathematics",
    "Science",
    "English",
    "Social Studies",
    "Physical Education",
    "Arts",
    "Computer Science",
    "Foreign Languages",
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Subject Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Advanced Mathematics"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Subject Code</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., MATH301"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description of the subject..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grade Level</Label>
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
          <Label htmlFor="credits">Credits</Label>
          <Input
            id="credits"
            name="credits"
            type="number"
            value={formData.credits}
            onChange={handleChange}
            min="1"
            max="6"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleChange}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="isActive">Active Subject</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update Subject" : "Add Subject"}</Button>
      </div>
    </form>
  )
}
