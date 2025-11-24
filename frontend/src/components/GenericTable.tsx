import React, { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface GenericTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onAdd: () => void;
  isLoading?: boolean;
}

export function GenericTable<T extends { id: string }>({
  title,
  data,
  columns,
  onAdd,
  isLoading = false,
}: GenericTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((item) => {
    const searchStr = searchTerm.toLowerCase();
    return Object.values(item as any).some((val) =>
      String(val).toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 border border-transparent bg-white rounded-2xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white sm:text-sm transition-all shadow-soft hover:shadow-md"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center justify-center p-3 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all shadow-soft">
            <Filter size={18} />
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Modern Floating List */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="bg-white">
                  {columns.map((_, j) => (
                    <td
                      key={j}
                      className="px-6 py-5 first:rounded-l-2xl last:rounded-r-2xl border-y border-transparent"
                    >
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                    </td>
                  ))}
                  <td className="px-6 py-5 rounded-r-2xl"></td>
                </tr>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="bg-white group transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 hover:scale-[1.01] hover:z-10 relative"
                >
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className={`px-6 py-5 text-sm text-slate-600 first:rounded-l-2xl border-y first:border-l border-transparent group-hover:border-primary-100/50 ${
                        col.className || ""
                      }`}
                    >
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-20">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                      <Search size={32} className="opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-slate-600">
                      No results found
                    </p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Pagination */}
      {!isLoading && filteredData.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-500 px-2">
          <span>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredData.length}
            </span>{" "}
            entries
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 disabled:opacity-50 transition-all shadow-sm">
              Previous
            </button>
            <button className="px-4 py-2 bg-white border border-transparent hover:border-slate-200 rounded-lg text-slate-600 hover:text-primary-600 transition-all shadow-sm">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
