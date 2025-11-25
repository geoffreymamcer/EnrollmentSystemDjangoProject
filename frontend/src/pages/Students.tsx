/* 🏁 START OF CHANGE: Imports 🏁 */
import React, { useEffect, useState } from "react";
import { GenericTable } from "../components/GenericTable";
// ❌ DELETED: MockService removed
// import { MockService } from "../services/mockdata";
import type { Student, Department } from "../types";
import { Modal } from "../components/Modal";
import type { FormField } from "../components/Modal";
// ➕ 🟢 ADDED: Icons for UI feedback and Actions
import { AlertCircle, MoreVertical, Pencil, Trash2 } from "lucide-react";
/* 🛑 END OF CHANGE 🛑 */
import BASE_URL from "../api/base_url";

/* 🏁 START OF CHANGE: Action Menu Component 🏁 */
// ➕ 🟢 ADDED: Dropdown for Edit/Delete
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

const Students: React.FC = () => {
  const [data, setData] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* 🏁 START OF CHANGE: State Management 🏁 */
  // ➕ 🟢 ADDED: State for errors and tracking edits
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Student | null>(null);
  /* 🛑 END OF CHANGE 🛑 */

  // ➕ 🟢 ADDED: Auth Helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  /* 🏁 START OF CHANGE: Fetch Data 🏁 */
  // ✏️ MODIFIED: Replaced MockService with real API calls
  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      // 🚀 Fetch Students and Departments in parallel
      const [stuRes, deptRes] = await Promise.all([
        fetch(`${BASE_URL}/api/students/`, { headers }),
        fetch(`${BASE_URL}/api/departments/`, { headers }),
      ]);

      if (!stuRes.ok || !deptRes.ok) throw new Error("Failed to fetch data");

      const stuData = await stuRes.json();
      const deptData = await deptRes.json();

      // 🔄 TRANSFORM: Django (snake_case) -> React (camelCase)
      const formattedStudents: Student[] = stuData.map((item: any) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        dob: item.dob,
        departmentId: item.department, // Django sends ID
      }));

      setDepartments(deptData);
      setData(formattedStudents);
    } catch (err) {
      setError("Failed to load students directory.");
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
  // ➕ 🟢 ADDED: Unified Save (Create/Update) Logic
  const handleSave = async (formData: any) => {
    try {
      // 🔄 TRANSFORM: React (camelCase) -> Django (snake_case)
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        dob: formData.dob,
        department: formData.departmentId, // Send ID to backend
      };

      let url = `${BASE_URL}/api/students/`;
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

      if (!response.ok) throw new Error("Failed to save student");

      const savedItem = await response.json();

      // 🔄 TRANSFORM BACK: Django -> React
      const newItem: Student = {
        id: savedItem.id,
        firstName: savedItem.first_name,
        lastName: savedItem.last_name,
        email: savedItem.email,
        dob: savedItem.dob,
        departmentId: savedItem.department,
      };

      // ✨ Update UI immediately
      if (editingItem) {
        setData(data.map((item) => (item.id === newItem.id ? newItem : item)));
      } else {
        setData([newItem, ...data]);
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert("Error saving student record.");
    }
  };

  // ➕ 🟢 ADDED: Delete Logic
  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      const response = await fetch(`${BASE_URL}/api/students/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete");

      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      alert("Could not delete student.");
    }
  };

  // ➕ 🟢 ADDED: Modal Helpers
  const openEditModal = (item: Student) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };
  /* 🛑 END OF CHANGE 🛑 */

  // Helper to get Department Name
  const getDeptName = (id: string | number) => {
    const dept = departments.find((d: any) => d.id == id);
    return dept ? dept.name : "Unknown";
  };

  const formFields: FormField[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "Jane",
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Doe",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "jane.doe@student.edu",
      className: "md:col-span-2",
    },
    { name: "dob", label: "Date of Birth", type: "date", required: true },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      required: true,
      // ✏️ MODIFIED: Dynamic options from API
      options: departments.map((d: any) => ({ label: d.name, value: d.id })),
    },
  ];

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
      <GenericTable<Student>
        title="Students Directory"
        data={data}
        isLoading={loading}
        onAdd={openCreateModal} // ✏️ MODIFIED: Use new handler
        columns={[
          {
            header: "Name",
            accessor: (item) => (
              <div>
                <div className="font-medium text-slate-900">
                  {item.firstName} {item.lastName}
                </div>
                <div className="text-xs text-slate-500">ID: {item.id}</div>
              </div>
            ),
          },
          { header: "Email", accessor: (item) => item.email },
          { header: "Date of Birth", accessor: (item) => item.dob },
          {
            header: "Department",
            // ✏️ MODIFIED: Use helper function
            accessor: (item) => (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {getDeptName(item.departmentId)}
              </span>
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
        title={editingItem ? "Edit Student" : "Register New Student"}
        fields={formFields}
        onSubmit={handleSave}
        // ➕ 🟢 ADDED: Pass existing data
        initialData={editingItem || undefined}
      />
    </>
  );
};

export default Students;
