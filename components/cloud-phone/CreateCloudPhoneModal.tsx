import React, { useState } from "react";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import {
  CheckProxyResponseData,
  MobileType,
  ProxyItem,
} from "../../models/cloud-phone.model";
import {
  useCreateCloudPhone,
  useGetProxies,
} from "../../react-query/cloud-phone";
import ManageProxiesModal from "./ManageProxiesModal";

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
  const [isManageProxiesOpen, setIsManageProxiesOpen] = useState(false);

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
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Create Cloud Phone
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Name
            </label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Type
            </label>
            <select
              value={mobileType}
              onChange={(e) => setMobileType(e.target.value as MobileType)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {MOBILE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Proxy
              </label>
              <button
                type="button"
                onClick={() => setIsManageProxiesOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Manage Proxies
              </button>
            </div>
            {proxiesData?.data?.length ? (
              <Dropdown
                value={proxyNumber}
                onChange={(e) => setProxyNumber(e.value)}
                options={proxiesData.data}
                optionValue="serialNo"
                optionLabel="server"
                placeholder="Select a proxy"
                filter
                filterBy="server,data.outboundIP,serialNo"
                filterMatchMode="contains"
                className="w-full"
                itemTemplate={(
                  option: ProxyItem & { data: CheckProxyResponseData },
                ) => (
                  <div className="flex flex-col ">
                    <span className="font-bold">
                      {option.data.outboundIP}:{option.server} (
                      {option.serialNo})
                    </span>
                    {option.data && (
                      <div className="text-xs  text-gray-500">
                        {option.data.countryCode} - {option.data.countryName},{" "}
                        {option.data.subdivision}, {option.data.city} (
                        {option.data.timezone})
                      </div>
                    )}
                  </div>
                )}
                valueTemplate={(
                  option: ProxyItem & { data: CheckProxyResponseData },
                  props: DropdownProps,
                ) => {
                  if (option) {
                    return (
                      <div className="flex flex-col">
                        <span>
                          {option.server}:{option.port} ({option.serialNo})
                        </span>
                        {option.data && (
                          <span className="text-xs text-gray-500">
                            {option.data.countryCode} - {option.data.city}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return <span>{props.placeholder}</span>;
                }}
                pt={{
                  root: {
                    className:
                      "w-full rounded-md border border-gray-300 bg-white text-gray-700",
                  },
                  input: {
                    className:
                      "w-full p-2 text-sm focus:outline-none bg-transparent",
                  },
                  trigger: {
                    className: "flex items-center justify-center w-8",
                  },
                  panel: {
                    className: "bg-white border",
                  },
                  item: {
                    className: "p-2  cursor-pointer",
                  },
                }}
              />
            ) : (
              <input
                type="number"
                required
                placeholder="Enter Proxy Number"
                value={proxyNumber}
                onChange={(e) => setProxyNumber(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
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

      <ManageProxiesModal
        isOpen={isManageProxiesOpen}
        onClose={() => setIsManageProxiesOpen(false)}
      />
    </div>
  );
};

export default CreateCloudPhoneModal;
