import React, { useState, useEffect } from "react";
import { X, Check, ChevronDown } from "lucide-react";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "date" | "number" | "select" | "tel";
  options?: FieldOption[];
  required?: boolean;
  placeholder?: string;
  className?: string; // For grid spans
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  fields,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({});
      }
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialData]);

  if (!isOpen && !isAnimating) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] transition-all duration-300 transform ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form
            id="dynamic-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {fields.map((field) => (
              <div key={field.name} className={`${field.className || ""}`}>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === "select" ? (
                  <div className="relative">
                    <select
                      id={field.name}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="block w-full appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="" disabled>
                        Select {field.label}
                      </option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                )}
              </div>
            ))}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="dynamic-form"
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all flex items-center gap-2"
          >
            <Check size={18} />
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
};
