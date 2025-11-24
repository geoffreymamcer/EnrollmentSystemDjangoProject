import type {
  Department,
  Instructor,
  Student,
  Course,
  Enrollment,
} from "../types";

const departments: Department[] = Array.from({ length: 10 }, (_, i) => ({
  id: `dept-${i + 1}`,
  name: [
    "Computer Science",
    "Mathematics",
    "Physics",
    "History",
    "Literature",
    "Biology",
    "Chemistry",
    "Engineering",
    "Psychology",
    "Business",
  ][i],
  code: [
    "CS",
    "MATH",
    "PHYS",
    "HIST",
    "LIT",
    "BIO",
    "CHEM",
    "ENG",
    "PSY",
    "BUS",
  ][i],
  officeLocation: `Building ${String.fromCharCode(65 + i)} - Room 10${i}`,
  phone: `555-010${i}`,
  establishedDate: `19${80 + i}-08-15`,
}));

const instructors: Instructor[] = Array.from({ length: 10 }, (_, i) => ({
  id: `inst-${i + 1}`,
  firstName: [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Evan",
    "Fiona",
    "George",
    "Hannah",
    "Ian",
    "Julia",
  ][i],
  lastName: [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ][i],
  email: `instructor${i + 1}@edunexus.edu`,
  hireDate: `201${i}-05-20`,
  departmentId: departments[i % departments.length].id,
}));

const students: Student[] = Array.from({ length: 10 }, (_, i) => ({
  id: `stu-${i + 1}`,
  firstName: [
    "Liam",
    "Olivia",
    "Noah",
    "Emma",
    "Oliver",
    "Ava",
    "Elijah",
    "Charlotte",
    "William",
    "Sophia",
  ][i],
  lastName: [
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Thompson",
    "Garcia",
    "Martinez",
    "Robinson",
  ][i],
  email: `student${i + 1}@student.edunexus.edu`,
  dob: `200${i % 4}-0${(i % 9) + 1}-12`,
  departmentId: departments[i % departments.length].id,
}));

const courses: Course[] = Array.from({ length: 10 }, (_, i) => ({
  id: `course-${i + 1}`,
  title: [
    "Intro to CS",
    "Calculus I",
    "Mechanics",
    "World History",
    "Shakespeare",
    "Cell Biology",
    "Organic Chem",
    "Thermodynamics",
    "Cognitive Psych",
    "Marketing 101",
  ][i],
  courseCode: `${departments[i].code}10${i}`,
  credits: i % 2 === 0 ? 3 : 4,
  semester: i % 2 === 0 ? "Fall 2024" : "Spring 2025",
  instructorId: instructors[i].id,
}));

const enrollments: Enrollment[] = Array.from({ length: 10 }, (_, i) => ({
  id: `enr-${i + 1}`,
  studentId: students[i].id,
  courseId: courses[9 - i].id, // Mix it up
  enrollmentDate: `2024-08-${15 + i}`,
  status: i % 5 === 0 ? "Dropped" : i % 3 === 0 ? "Completed" : "Enrolled",
  grade: i % 3 === 0 ? ["A", "B", "A-"][i % 3] : undefined,
}));

export const MockService = {
  getDepartments: async (): Promise<Department[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...departments]), 300)
    );
  },
  getInstructors: async (): Promise<Instructor[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...instructors]), 300)
    );
  },
  getStudents: async (): Promise<Student[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...students]), 300)
    );
  },
  getCourses: async (): Promise<Course[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...courses]), 300)
    );
  },
  getEnrollments: async (): Promise<Enrollment[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...enrollments]), 300)
    );
  },
  // Helpers to resolve names for IDs
  getDepartmentName: (id: string) =>
    departments.find((d) => d.id === id)?.name || "Unknown",
  getInstructorName: (id: string) => {
    const inst = instructors.find((i) => i.id === id);
    return inst ? `${inst.firstName} ${inst.lastName}` : "Unknown";
  },
  getStudentName: (id: string) => {
    const stu = students.find((s) => s.id === id);
    return stu ? `${stu.firstName} ${stu.lastName}` : "Unknown";
  },
  getCourseTitle: (id: string) =>
    courses.find((c) => c.id === id)?.title || "Unknown",
};
