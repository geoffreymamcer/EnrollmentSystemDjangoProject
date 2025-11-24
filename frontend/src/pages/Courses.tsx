import React, { useEffect, useState } from "react";
import { GenericTable } from "../components/GenericTable";
import type { Course, Instructor } from "../types";
import { Modal } from "../components/Modal";
import type { FormField } from "../components/Modal";
import {
  Loader2,
  AlertCircle,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

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

const Courses: React.FC = () => {
  const [data, setData] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Course | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const [courseRes, instRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/courses/", { headers }),
        fetch("http://127.0.0.1:8000/api/instructors/", { headers }),
      ]);

      if (!courseRes.ok || !instRes.ok) throw new Error("Failed to fetch data");

      const courseData = await courseRes.json();
      const instData = await instRes.json();

      const formattedCourses: Course[] = courseData.map((item: any) => ({
        id: item.id,
        title: item.title,
        courseCode: item.course_code,
        credits: item.credits,
        semester: item.semester,
        instructorId: item.instructor,
      }));

      const formattedInstructors: Instructor[] = instData.map((item: any) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        hireDate: item.hire_date,
        departmentId: item.department,
      }));

      setInstructors(formattedInstructors);
      setData(formattedCourses);
    } catch (err) {
      setError("Failed to load course catalog.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (formData: any) => {
    try {
      const payload = {
        title: formData.title,
        course_code: formData.courseCode,
        credits: parseInt(formData.credits),
        semester: formData.semester,
        instructor: formData.instructorId,
      };

      let url = "http://127.0.0.1:8000/api/courses/";
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

      if (!response.ok) throw new Error("Failed to save course");

      const savedItem = await response.json();

      const newItem: Course = {
        id: savedItem.id,
        title: savedItem.title,
        courseCode: savedItem.course_code,
        credits: savedItem.credits,
        semester: savedItem.semester,
        instructorId: savedItem.instructor,
      };

      if (editingItem) {
        setData(data.map((item) => (item.id === newItem.id ? newItem : item)));
      } else {
        setData([newItem, ...data]);
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert("Error saving course. Please check inputs.");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/courses/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete");

      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      alert("Could not delete course.");
    }
  };

  const openEditModal = (item: Course) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const getInstructorName = (id: string | number) => {
    const inst = instructors.find((i) => i.id == id);
    return inst ? `${inst.firstName} ${inst.lastName}` : "Unassigned";
  };

  const formFields: FormField[] = [
    {
      name: "title",
      label: "Course Title",
      type: "text",
      required: true,
      placeholder: "Introduction to Psychology",
      className: "md:col-span-2",
    },
    {
      name: "courseCode",
      label: "Course Code",
      type: "text",
      required: true,
      placeholder: "PSY101",
    },
    {
      name: "credits",
      label: "Credits",
      type: "number",
      required: true,
      placeholder: "3",
    },
    {
      name: "semester",
      label: "Semester",
      type: "select",
      required: true,
      options: [
        { label: "Fall 2024", value: "Fall 2024" },
        { label: "Spring 2025", value: "Spring 2025" },
        { label: "Summer 2025", value: "Summer 2025" },
      ],
    },
    {
      name: "instructorId",
      label: "Lead Instructor",
      type: "select",
      required: true,
      options: instructors.map((i) => ({
        label: `${i.firstName} ${i.lastName}`,
        value: i.id.toString(),
      })),
    },
  ];

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <>
      <GenericTable<Course>
        title="Course Catalog"
        data={data}
        isLoading={loading}
        onAdd={openCreateModal}
        columns={[
          {
            header: "Code",
            accessor: (item) => (
              <span className="font-mono font-medium text-slate-600">
                {item.courseCode}
              </span>
            ),
          },
          {
            header: "Title",
            accessor: (item) => (
              <span className="font-medium text-indigo-600">{item.title}</span>
            ),
          },
          {
            header: "Credits",
            accessor: (item) => (
              <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                {item.credits} Credits
              </span>
            ),
          },
          { header: "Semester", accessor: (item) => item.semester },
          {
            header: "Instructor",
            accessor: (item) => getInstructorName(item.instructorId),
          },
          {
            header: "",
            accessor: (item) => (
              <ActionMenu
                onEdit={() => openEditModal(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ),
          },
        ]}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Course" : "Create New Course"}
        fields={formFields}
        onSubmit={handleSave}
        initialData={editingItem || undefined}
      />
    </>
  );
};

export default Courses;
