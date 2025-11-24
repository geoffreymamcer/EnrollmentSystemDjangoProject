/* 🏁 START OF CHANGE: Imports 🏁 */
import React, { useEffect, useState } from "react";
import { GenericTable } from "../components/GenericTable";
// ❌ DELETED: MockService removed
// import { MockService } from "../services/mockdata";
import type { Enrollment, Student, Course } from "../types";
import { EnrollmentStatus } from "../types";
import { Modal } from "../components/Modal";
import type { FormField } from "../components/Modal";
// ➕ 🟢 ADDED: Icons and UI components
import {
  Loader2,
  AlertCircle,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
/* 🛑 END OF CHANGE 🛑 */

/* 🏁 START OF CHANGE: Action Menu Component 🏁 */
// ➕ 🟢 ADDED: Dropdown for table actions
const ActionMenu = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onEdit}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};
/* 🛑 END OF CHANGE 🛑 */

const Enrollments: React.FC = () => {
  const [data, setData] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* 🏁 START OF CHANGE: State Management 🏁 */
  // ➕ 🟢 ADDED: State for errors and editing
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Enrollment | null>(null);
  /* 🛑 END OF CHANGE 🛑 */

  // ➕ 🟢 ADDED: Auth Helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  /* 🏁 START OF CHANGE: Data Fetching 🏁 */
  // ✏️ MODIFIED: Fetch 3 distinct resources
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      // 🚀 Request Enrollments, Students, and Courses in parallel
      const [enrRes, stuRes, courseRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/enrollments/", { headers }),
        fetch("http://127.0.0.1:8000/api/students/", { headers }),
        fetch("http://127.0.0.1:8000/api/courses/", { headers }),
      ]);

      if (!enrRes.ok || !stuRes.ok || !courseRes.ok)
        throw new Error("Failed to fetch data");

      const enrData = await enrRes.json();
      const stuData = await stuRes.json();
      const courseData = await courseRes.json();

      // 🔄 TRANSFORM: Django (snake_case) -> React (camelCase)
      const formattedEnrollments: Enrollment[] = enrData.map((item: any) => ({
        id: item.id,
        studentId: item.student, // DB sends ID
        courseId: item.course, // DB sends ID
        enrollmentDate: item.enrollment_date,
        status: item.status,
        grade: item.grade,
      }));

      // 🔄 TRANSFORM Students
      const formattedStudents: Student[] = stuData.map((item: any) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        dob: item.dob,
        departmentId: item.department,
      }));

      // 🔄 TRANSFORM Courses
      const formattedCourses: Course[] = courseData.map((item: any) => ({
        id: item.id,
        title: item.title,
        courseCode: item.course_code,
        credits: item.credits,
        semester: item.semester,
        instructorId: item.instructor,
      }));

      setStudents(formattedStudents);
      setCourses(formattedCourses);
      setData(formattedEnrollments);
    } catch (err) {
      setError("Failed to load enrollments.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  /* 🛑 END OF CHANGE 🛑 */

  /* 🏁 START OF CHANGE: CRUD Operations 🏁 */
  // ➕ 🟢 ADDED: Save Logic (Create/Update)
  const handleSave = async (formData: any) => {
    try {
      // 🔄 TRANSFORM: React -> Django Payload
      const payload = {
        student: formData.studentId, // ID
        course: formData.courseId, // ID
        status: formData.status || "Enrolled",
        grade: formData.grade || null, // Allow empty grade
        // enrollment_date is usually auto_now_add in Django, but if you need to edit it, add it here.
      };

      let url = "http://127.0.0.1:8000/api/enrollments/";
      let method = "POST";

      if (editingItem) {
        url += `${editingItem.id}/`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save enrollment");

      const savedItem = await response.json();

      // 🔄 TRANSFORM BACK: Django -> React
      const newItem: Enrollment = {
        id: savedItem.id,
        studentId: savedItem.student,
        courseId: savedItem.course,
        enrollmentDate: savedItem.enrollment_date,
        status: savedItem.status,
        grade: savedItem.grade,
      };

      if (editingItem) {
        setData(data.map((item) => (item.id === newItem.id ? newItem : item)));
      } else {
        setData([newItem, ...data]);
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert("Error saving enrollment.");
    }
  };

  // ➕ 🟢 ADDED: Delete Logic
  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this enrollment?"))
      return;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/enrollments/${id}/`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error("Failed to delete");

      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      alert("Could not delete enrollment.");
    }
  };

  const openEditModal = (item: Enrollment) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };
  /* 🛑 END OF CHANGE 🛑 */

  /* 🏁 START OF CHANGE: Helpers for Display 🏁 */
  // ✏️ MODIFIED: Helpers using real state data instead of MockService
  const getStudentName = (id: string | number) => {
    const s = students.find((student) => student.id == id);
    return s ? `${s.firstName} ${s.lastName}` : "Unknown Student";
  };

  const getCourseTitle = (id: string | number) => {
    const c = courses.find((course) => course.id == id);
    return c ? `${c.courseCode} - ${c.title}` : "Unknown Course";
  };
  /* 🛑 END OF CHANGE 🛑 */

  /* 🏁 START OF CHANGE: Form Fields 🏁 */
  const formFields: FormField[] = [
    {
      name: "studentId",
      label: "Student",
      type: "select",
      required: true,
      className: "md:col-span-2",
      options: students.map((s) => ({
        label: `${s.firstName} ${s.lastName} (${s.email})`,
        value: s.id.toString(),
      })),
    },
    {
      name: "courseId",
      label: "Course",
      type: "select",
      required: true,
      className: "md:col-span-2",
      options: courses.map((c) => ({
        label: `${c.courseCode} - ${c.title}`,
        value: c.id.toString(),
      })),
    },
    // ➕ 🟢 ADDED: Status and Grade fields for full editing
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { label: "Enrolled", value: "Enrolled" },
        { label: "Dropped", value: "Dropped" },
        { label: "Completed", value: "Completed" },
      ],
    },
    {
      name: "grade",
      label: "Grade (Optional)",
      type: "text",
      required: false,
      placeholder: "e.g. A, 95.5",
    },
  ];
  /* 🛑 END OF CHANGE 🛑 */

  const getStatusBadge = (
    status: (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus]
  ) => {
    switch (status) {
      case "Enrolled":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
            Enrolled
          </span>
        );
      case "Dropped":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
            Dropped
          </span>
        );
      case "Completed":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">
            Completed
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
            Unknown
          </span>
        );
    }
  };

  /* 🏁 START OF CHANGE: Error UI 🏁 */
  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }
  /* 🛑 END OF CHANGE 🛑 */

  return (
    <>
      <GenericTable<Enrollment>
        title="Student Enrollments"
        data={data}
        isLoading={loading}
        onAdd={openCreateModal} // ✏️ MODIFIED: Use new handler
        columns={[
          {
            header: "ID",
            accessor: (item) => (
              <span className="text-xs text-slate-400">{item.id}</span>
            ),
          },
          {
            header: "Student",
            // ✏️ MODIFIED: Use local helper
            accessor: (item) => (
              <span className="font-medium text-slate-900">
                {getStudentName(item.studentId)}
              </span>
            ),
          },
          {
            header: "Course",
            // ✏️ MODIFIED: Use local helper
            accessor: (item) => getCourseTitle(item.courseId),
          },
          { header: "Date", accessor: (item) => item.enrollmentDate },
          { header: "Status", accessor: (item) => getStatusBadge(item.status) },
          {
            header: "Grade",
            accessor: (item) =>
              item.grade ? (
                <span className="font-bold text-slate-800">{item.grade}</span>
              ) : (
                <span className="text-slate-300">-</span>
              ),
          },
          /* 🏁 START OF CHANGE: Actions Column 🏁 */
          // ➕ 🟢 ADDED: 3-dots menu
          {
            header: "",
            accessor: (item) => (
              <ActionMenu
                onEdit={() => openEditModal(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ),
          },
          /* 🛑 END OF CHANGE 🛑 */
        ]}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // ✏️ MODIFIED: Dynamic Title
        title={editingItem ? "Update Enrollment" : "Enroll New Student"}
        fields={formFields}
        onSubmit={handleSave}
        // ➕ 🟢 ADDED: Pass existing data
        initialData={editingItem || undefined}
      />
    </>
  );
};

export default Enrollments;
