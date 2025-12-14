import React, { useState } from "react";
import { MobileType } from "../../models/cloud-phone.model";
import {
  useCreateCloudPhone,
  useGetProxies,
} from "../../react-query/cloud-phone";

interface CreateCloudPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOBILE_TYPES: MobileType[] = [
  "Android 9",
  "Android 10",
  "Android 11",
  "Android 12",
  "Android 13",
  "Android 14",
  "Android 15",
];

const CreateCloudPhoneModal: React.FC<CreateCloudPhoneModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [profileName, setProfileName] = useState("");
  const [mobileType, setMobileType] = useState<MobileType>("Android 10");
  const [proxyNumber, setProxyNumber] = useState<number | "">("");

  const { mutate: createCloudPhone, isPending } = useCreateCloudPhone();
  const { data: proxiesData } = useGetProxies({ page: 1, limit: 100 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || proxyNumber === "") return;

    createCloudPhone(
      {
        profileName,
        mobileType,
        proxyNumber: Number(proxyNumber),
      },
      {
        onSuccess: () => {
          onClose();
          setProfileName("");
          setMobileType("Android 10");
          setProxyNumber("");
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Create Cloud Phone
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Name
            </label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mobile Type
            </label>
            <select
              value={mobileType}
              onChange={(e) => setMobileType(e.target.value as MobileType)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {MOBILE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Proxy
            </label>
            {proxiesData?.data?.length ? (
              <select
                required
                value={proxyNumber}
                onChange={(e) => setProxyNumber(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled>
                  Select a proxy
                </option>
                {proxiesData.data.map((proxy) => (
                  <option key={proxy.id} value={proxy.serialNo}>
                    {proxy.server}:{proxy.port} ({proxy.serialNo})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                required
                placeholder="Enter Proxy Number"
                value={proxyNumber}
                onChange={(e) => setProxyNumber(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            )}
            <p className="mt-1 text-xs text-gray-500">
              Select a proxy or enter proxy serial number.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCloudPhoneModal;
