import React, { useEffect, useState } from "react";
import { GenericTable } from "../components/GenericTable";
import { Modal } from "../components/Modal";
import type { Department } from "../types";
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
            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 flex items-center gap-2"
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

const Departments: React.FC = () => {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<Department | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/departments/", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch departments");
      const rawData = await response.json();

      const formattedData: Department[] = rawData.map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        officeLocation: item.office_location,
        phone: item.phone_contact,
        establishedDate: item.established_date,
      }));

      setData(formattedData);
    } catch (err) {
      setError("Could not load departments. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSave = async (formData: any) => {
    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        office_location: formData.officeLocation,
        phone_contact: formData.phone,
        established_date: formData.establishedDate,
      };

      let url = "http://127.0.0.1:8000/api/departments/";
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

      if (!response.ok) throw new Error("Failed to save department");

      const newItemRaw = await response.json();

      const newItem: Department = {
        id: newItemRaw.id,
        name: newItemRaw.name,
        code: newItemRaw.code,
        officeLocation: newItemRaw.office_location,
        phone: newItemRaw.phone_contact,
        establishedDate: newItemRaw.established_date,
      };

      if (editingItem) {
        setData(data.map((item) => (item.id === newItem.id ? newItem : item)));
      } else {
        setData([newItem, ...data]);
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert("Error saving department. Please try again.");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/departments/${id}/`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) throw new Error("Failed to delete");

      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      alert("Could not delete department.");
    }
  };

  const openEditModal = (dept: Department) => {
    setEditingItem(dept);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const formFields: FormField[] = [
    {
      name: "name",
      label: "Department Name",
      type: "text",
      required: true,
      placeholder: "e.g. Computer Science",
    },
    {
      name: "code",
      label: "Department Code",
      type: "text",
      required: true,
      placeholder: "e.g. CS",
    },
    {
      name: "officeLocation",
      label: "Office Location",
      type: "text",
      required: true,
      placeholder: "Building A, Room 101",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      required: true,
      placeholder: "555-0123",
    },
    {
      name: "establishedDate",
      label: "Established Date",
      type: "date",
      required: true,
    },
  ];

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchDepartments}
          className="mt-4 text-sm underline hover:text-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <GenericTable<Department>
        title="Departments"
        data={data}
        isLoading={loading}
        onAdd={openCreateModal}
        columns={[
          {
            header: "Name",
            accessor: (item) => (
              <span className="font-semibold text-indigo-900">{item.name}</span>
            ),
          },
          {
            header: "Code",
            accessor: (item) => (
              <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                {item.code}
              </code>
            ),
          },
          { header: "Location", accessor: (item) => item.officeLocation },
          { header: "Phone", accessor: (item) => item.phone },
          { header: "Established", accessor: (item) => item.establishedDate },
          {
            header: "", // Empty header for aesthetics
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
        title={editingItem ? "Edit Department" : "Add New Department"}
        fields={formFields}
        onSubmit={handleSave}
        initialData={editingItem || undefined}
      />
    </>
  );
};

export default Departments;
