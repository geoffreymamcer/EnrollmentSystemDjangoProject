import React, { useEffect, useState } from "react";
import { GenericTable } from "../components/GenericTable";
import type { Instructor, Department } from "../types";
import { Mail, MoreVertical, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Modal } from "../components/Modal";
import type { FormField } from "../components/Modal";
import BASE_URL from "../api/base_url";

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

const Instructors: React.FC = () => {
  const [data, setData] = useState<Instructor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Instructor | null>(null);

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

      const [instRes, deptRes] = await Promise.all([
        fetch(`${BASE_URL}/api/instructors/`, { headers }),
        fetch(`${BASE_URL}/api/departments/`, { headers }),
      ]);

      if (!instRes.ok || !deptRes.ok) throw new Error("Failed to fetch data");

      const instData = await instRes.json();
      const deptData = await deptRes.json();

      const formattedInstructors: Instructor[] = instData.map((item: any) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email,
        hireDate: item.hire_date,
        departmentId: item.department,
      }));

      setDepartments(deptData);
      setData(formattedInstructors);
    } catch (err) {
      setError("Failed to load instructors.");
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
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        hire_date: formData.hireDate,
        department: formData.departmentId,
      };

      let url = `${BASE_URL}/api/instructors/`;
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

      if (!response.ok) throw new Error("Failed to save");

      const savedItem = await response.json();

      const newItem: Instructor = {
        id: savedItem.id,
        firstName: savedItem.first_name,
        lastName: savedItem.last_name,
        email: savedItem.email,
        hireDate: savedItem.hire_date,
        departmentId: savedItem.department,
      };

      if (editingItem) {
        setData(data.map((item) => (item.id === newItem.id ? newItem : item)));
      } else {
        setData([newItem, ...data]);
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert("Error saving instructor.");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this instructor?"))
      return;
    try {
      await fetch(`${BASE_URL}/api/instructors/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      alert("Error deleting instructor.");
    }
  };

  const openEditModal = (item: Instructor) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const getDeptName = (id: string | number) => {
    const dept = departments.find((d: any) => d.id == id);
    return dept ? dept.name : "Unknown Dept";
  };

  const formFields: FormField[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "John",
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
      placeholder: "john.doe@edunexus.edu",
      className: "md:col-span-2",
    },
    {
      name: "departmentId",
      label: "Department",
      type: "select",
      required: true,
      options: departments.map((d: any) => ({ label: d.name, value: d.id })),
    },
    { name: "hireDate", label: "Hire Date", type: "date", required: true },
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
      <GenericTable<Instructor>
        title="Faculty & Instructors"
        data={data}
        isLoading={loading}
        onAdd={openCreateModal}
        columns={[
          {
            header: "Instructor",
            accessor: (item) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {item.firstName[0]}
                  {item.lastName[0]}
                </div>
                <div>
                  <div className="font-medium text-slate-900">
                    {item.firstName} {item.lastName}
                  </div>
                  <div className="text-xs text-slate-500">ID: {item.id}</div>
                </div>
              </div>
            ),
          },
          {
            header: "Contact",
            accessor: (item) => (
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={14} />
                {item.email}
              </div>
            ),
          },
          {
            header: "Department",
            accessor: (item) => (
              <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-600">
                {getDeptName(item.departmentId)}
              </span>
            ),
          },
          { header: "Hired", accessor: (item) => item.hireDate },
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
        title={editingItem ? "Edit Instructor" : "Add New Instructor"}
        fields={formFields}
        onSubmit={handleSave}
        initialData={editingItem || undefined}
      />
    </>
  );
};

export default Instructors;
