import React, { useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { ProxyItem } from "../../models/cloud-phone.model";
import { useDeleteProxy, useGetProxies } from "../../react-query/cloud-phone";
import Swal from "sweetalert2";
import CreateUpdateProxyModal from "./CreateUpdateProxyModal";

interface ManageProxiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageProxiesModal: React.FC<ManageProxiesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [page, setPage] = useState(1);
  const limit = 100;
  const { data: proxiesData, isLoading } = useGetProxies({ page, limit });
  const { mutate: deleteProxy, isPending: isDeleting } = useDeleteProxy();

  const [isCreateUpdateOpen, setIsCreateUpdateOpen] = useState(false);
  const [proxyToEdit, setProxyToEdit] = useState<ProxyItem | null>(null);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProxy(
          { id },
          {
            onSuccess: () => {
              Swal.fire("Deleted!", "Proxy has been deleted.", "success");
            },
            onError: (error) => {
              console.error(error);
              Swal.fire("Error!", "Failed to delete proxy.", "error");
            },
          },
        );
      }
    });
  };

  const handleEdit = (proxy: ProxyItem) => {
    setProxyToEdit(proxy);
    setIsCreateUpdateOpen(true);
  };

  const handleCreate = () => {
    setProxyToEdit(null);
    setIsCreateUpdateOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Manage Proxies
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <FaPlus /> Add Proxy
            </button>
            <button
              onClick={onClose}
              className="rounded bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="py-10 text-center">Loading proxies...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Serial No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {proxiesData?.data?.map((proxy) => (
                  <tr key={proxy.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {proxy.serialNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        {proxy.scheme}://{proxy.server}:{proxy.port}
                      </div>
                      {proxy.username && (
                        <div className="text-xs text-gray-400">
                          User: {proxy.username}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>{proxy.data.outboundIP}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {proxy.data ? (
                        <div>
                          <div>
                            {proxy.data.city}, {proxy.data.countryName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {proxy.data.timezone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Checking...</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(proxy)}
                        className="mr-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(proxy.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {!proxiesData?.data?.length && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No proxies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {proxiesData?.meta && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing page {proxiesData.meta.currentPage} of{" "}
              {proxiesData.meta.lastPage}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!proxiesData.meta.prev}
                className="rounded border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!proxiesData.meta.next}
                className="rounded border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateUpdateProxyModal
        isOpen={isCreateUpdateOpen}
        onClose={() => setIsCreateUpdateOpen(false)}
        proxyToEdit={proxyToEdit}
      />
    </div>
  );
};

export default ManageProxiesModal;
