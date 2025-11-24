export interface Department {
  id: string;
  name: string;
  code: string;
  officeLocation: string;
  phone: string;
  establishedDate: string;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hireDate: string;
  departmentId: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  departmentId: string;
}

export interface Course {
  id: string;
  title: string;
  courseCode: string;
  credits: number;
  semester: string;
  instructorId: string;
}

export const EnrollmentStatus = {
  Enrolled: "Enrolled",
  Dropped: "Dropped",
  Completed: "Completed",
} as const;

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  status: (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];
  grade?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
