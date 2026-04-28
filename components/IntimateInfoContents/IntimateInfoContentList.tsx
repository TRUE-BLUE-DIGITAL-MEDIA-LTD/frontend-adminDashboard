import React, { useState } from "react";
import {
  useIntimateInfoContents,
  useDeleteIntimateInfoContent,
} from "../../react-query/intimate-info-content";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import Swal from "sweetalert2";

type Props = {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
};

const statusOptions = [
  { label: "All", value: "" },
  { label: "Publish", value: "publish" },
  { label: "Unpublish", value: "unpublish" },
];

const sortOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

const IntimateInfoContentList = ({ onCreateNew, onEdit }: Props) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = useIntimateInfoContents({
    page,
    limit: 10,
    search: search || undefined,
    status: status || undefined,
    sortBy: "createAt",
    sortOrder,
  });

  const deleteMutation = useDeleteIntimateInfoContent();

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteMutation.mutateAsync(id);
        Swal.fire("Deleted!", "Your content has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete.", "error");
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <h2 className="text-2xl font-bold text-gray-800">Content Management</h2>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <FaPlus /> Create New
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="p-input-icon-left flex-1">
          <i className="pi pi-search" />
          <InputText
            placeholder="Search by title or keyword..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <Dropdown
          value={status}
          options={statusOptions}
          onChange={(e) => {
            setStatus(e.value);
            setPage(1);
          }}
          placeholder="Filter by Status"
          className="w-full md:w-48"
        />

        <Dropdown
          value={sortOrder}
          options={sortOptions}
          onChange={(e) => {
            setSortOrder(e.value);
            setPage(1);
          }}
          placeholder="Sort By"
          className="w-full md:w-48"
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Keyword</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created At</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No contents found.
                    </td>
                  </tr>
                ) : (
                  data?.data?.map((item: any) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.title}
                      </td>
                      <td className="px-6 py-4">{item.keyword || "-"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.status === "publish"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(item.createAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEdit(item.id)}
                            className="rounded-full bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-full bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing page {data.meta.page} of {data.meta.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page === data.meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IntimateInfoContentList;
