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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface bg-opacity-50">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg bg-panel p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-fg">
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
              className="rounded bg-panel-raised px-3 py-2 text-sm font-medium text-fg-muted hover:bg-hover dark:text-fg-subtle"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="py-10 text-center">Loading proxies...</div>
          ) : (
            <table className="min-w-full divide-y divide-line dark:divide-line">
              <thead className="bg-panel-raised">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-muted dark:text-fg-subtle">
                    Serial No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-muted dark:text-fg-subtle">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-muted dark:text-fg-subtle">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-muted dark:text-fg-subtle">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-fg-muted dark:text-fg-subtle">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-panel dark:divide-line">
                {proxiesData?.data?.map((proxy) => (
                  <tr key={proxy.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-fg">
                      {proxy.serialNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-fg-muted dark:text-fg-subtle">
                      <div>
                        {proxy.scheme}://{proxy.server}:{proxy.port}
                      </div>
                      {proxy.username && (
                        <div className="text-xs text-fg-subtle">
                          User: {proxy.username}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-fg-muted dark:text-fg-subtle">
                      <div>{proxy.data.outboundIP}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-fg-muted dark:text-fg-subtle">
                      {proxy.data ? (
                        <div>
                          <div>
                            {proxy.data.city}, {proxy.data.countryName}
                          </div>
                          <div className="text-xs text-fg-subtle">
                            {proxy.data.timezone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-fg-subtle">Checking...</span>
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
                      className="px-6 py-4 text-center text-sm text-fg-muted"
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
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4 dark:border-line-strong">
            <div className="text-sm text-fg-muted dark:text-fg-subtle">
              Showing page {proxiesData.meta.currentPage} of{" "}
              {proxiesData.meta.lastPage}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!proxiesData.meta.prev}
                className="rounded border border-line px-3 py-1 text-sm font-medium hover:bg-hover disabled:opacity-50 dark:border-line-strong"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!proxiesData.meta.next}
                className="rounded border border-line px-3 py-1 text-sm font-medium hover:bg-hover disabled:opacity-50 dark:border-line-strong"
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
