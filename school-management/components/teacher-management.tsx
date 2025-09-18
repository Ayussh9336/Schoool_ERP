"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dataStore } from "@/lib/data-store";
import type { Subject, Teacher } from "@/lib/types";
import { BookOpen, Edit, Plus, Search, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    specialization: "",
    hireDate: "",
  });

  useEffect(() => {
    setTeachers(dataStore.getTeachers());
    setSubjects(dataStore.getSubjects());
  }, []);

  const filteredTeachers = teachers.filter(
    (teacher) =>
      `${teacher.firstName} ${teacher.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      specialization: "",
      hireDate: "",
    });
    setEditingTeacher(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTeacher) {
      const updatedTeacher: Teacher = {
        ...editingTeacher,
        ...formData,
        hireDate: formData.hireDate || editingTeacher.hireDate,
      };
      dataStore.updateTeacher(updatedTeacher);
    } else {
      const newTeacher: Omit<Teacher, "id"> = {
        ...formData,
        role: "teacher" as const,
        hireDate: formData.hireDate || new Date().toISOString().split("T")[0],
      };
      dataStore.addTeacher(newTeacher);
    }

    setTeachers(dataStore.getTeachers());
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      department: teacher.department,
      specialization: teacher.specialization,
      hireDate: teacher.hireDate,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (teacherId: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      dataStore.deleteTeacher(teacherId);
      setTeachers(dataStore.getTeachers());
    }
  };

  const getTeacherClasses = (teacherId: string) => {
    return dataStore.getClasses().filter((cls) => cls.teacherId === teacherId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Teacher Management</h2>
          <p className="text-muted-foreground">
            Manage faculty members and their assignments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </DialogTitle>
              <DialogDescription>
                {editingTeacher
                  ? "Update teacher information"
                  : "Enter the details for the new teacher"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Physical Education">
                      Physical Education
                    </SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                  placeholder="e.g., Algebra, Biology, Literature"
                />
              </div>
              <div>
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) =>
                    setFormData({ ...formData, hireDate: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTeacher ? "Update Teacher" : "Add Teacher"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search teachers by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => {
          const teacherClasses = getTeacherClasses(teacher.id);
          return (
            <Card key={teacher.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {teacher.firstName} {teacher.lastName}
                    </CardTitle>
                    <CardDescription>{teacher.email}</CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(teacher)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(teacher.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Badge variant="secondary">{teacher.department}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Specialization
                    </p>
                    <p className="font-medium">{teacher.specialization}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hire Date</p>
                    <p className="font-medium">
                      {new Date(teacher.hireDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="mr-1 h-4 w-4" />
                      {teacherClasses.length} Classes
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      {teacherClasses.reduce(
                        (total, cls) => total + (cls.studentIds?.length || 0),
                        0
                      )}{" "}
                      Students
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No teachers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "No teachers match your search criteria."
                : "Get started by adding your first teacher."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
