# 🏫 School Management System

A **full-featured school management system** built with **TypeScript**, designed to handle students, teachers, classes, grades, attendance, and reports.  
Includes **PDF report generation** (transcripts, grade reports, class lists, and school overviews).

---

## 🚀 Features

- 👩‍🎓 **Student Management**
  - Add, update, and track student records
  - Store enrollment, grades, attendance, and parent details

- 👨‍🏫 **Teacher Management**
  - Assign subjects, departments, and classes
  - Track experience, salary, and qualifications

- 🏫 **Class & Subject Management**
  - Manage subjects, class schedules, and enrollments
  - Auto-generate student lists and reports

- 📝 **Assessments & Grades**
  - Add assignments, quizzes, exams, and projects
  - Generate student transcripts and grade reports

- 📊 **Analytics & Reports**
  - Track total students, active teachers, and enrollments
  - Generate **PDF reports** for:
    - Student transcript
    - Class list
    - Grade report
    - School overview report

---

## 🛠️ Tech Stack

- **TypeScript**
- **Node.js**
- **jsPDF** + **jspdf-autotable** (for PDF reports)

---

## 📂 Project Structure

school-management/
│── lib/
│ ├── types.ts # TypeScript interfaces & types
│ ├── mock-data.ts # Mock data for students, teachers, classes
│ ├── data-store.ts # Data handling functions
│ ├── pdf-generator.ts # PDF report generation
│── README.md # Project documentation



---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/school-management.git
   cd school-management
npm install
npm start
npm run build
