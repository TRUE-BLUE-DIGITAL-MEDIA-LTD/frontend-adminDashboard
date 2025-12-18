import React, { useEffect, useState } from "react";
import {
  CreateProxyDto,
  ProxyItem,
  UpdateProxyDto,
} from "../../models/cloud-phone.model";
import { useCreateProxy, useUpdateProxy } from "../../react-query/cloud-phone";

interface CreateUpdateProxyModalProps {
  isOpen: boolean;
  onClose: () => void;
  proxyToEdit?: ProxyItem | null;
}

const CreateUpdateProxyModal: React.FC<CreateUpdateProxyModalProps> = ({
  isOpen,
  onClose,
  proxyToEdit,
}) => {
  const [scheme, setScheme] = useState("socks5");
  const [server, setServer] = useState("");
  const [port, setPort] = useState<number | "">("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: createProxy, isPending: isCreating } = useCreateProxy();
  const { mutate: updateProxy, isPending: isUpdating } = useUpdateProxy();

  useEffect(() => {
    if (proxyToEdit) {
      setScheme(proxyToEdit.scheme);
      setServer(proxyToEdit.server);
      setPort(proxyToEdit.port);
      setUsername(proxyToEdit.username || "");
      setPassword(proxyToEdit.password || "");
    } else {
      resetForm();
    }
  }, [proxyToEdit, isOpen]);

  const resetForm = () => {
    setScheme("socks5");
    setServer("");
    setPort("");
    setUsername("");
    setPassword("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!server || port === "") return;

    if (proxyToEdit) {
      const dto: UpdateProxyDto = {
        id: proxyToEdit.id,
        scheme,
        server,
        port: Number(port),
        username: username || undefined,
        password: password || undefined,
      };
      updateProxy(dto, {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      });
    } else {
      const dto: CreateProxyDto = {
        scheme,
        server,
        port: Number(port),
        username: username || undefined,
        password: password || undefined,
      };
      createProxy(dto, {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      });
    }
  };

  if (!isOpen) return null;

  const isPending = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          {proxyToEdit ? "Update Proxy" : "Create Proxy"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Scheme
            </label>
            <select
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="socks5">socks5</option>
              <option value="http">http</option>
              <option value="https">https</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Server
            </label>
            <input
              type="text"
              required
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="127.0.0.1"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Port
            </label>
            <input
              type="number"
              required
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              placeholder="8080"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username (Optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password (Optional)
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {isPending ? "Saving..." : proxyToEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUpdateProxyModal;
