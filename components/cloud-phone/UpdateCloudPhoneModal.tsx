import React, { useState, useEffect } from "react";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import {
  CheckProxyResponseData,
  CloudPhoneWithDetails,
  ProxyItem,
  UpdateCloudPhoneDto,
  ProxyConfigDto,
} from "../../models/cloud-phone.model";
import {
  useGetProxies,
  useUpdateCloudPhone,
} from "../../react-query/cloud-phone";
import ManageProxiesModal from "./ManageProxiesModal";
import Swal from "sweetalert2";

interface UpdateCloudPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CloudPhoneWithDetails | null;
}

const STATIC_PROXY_TYPES = [
  { label: "SOCKS5", value: 1 },
  { label: "HTTP", value: 2 },
  { label: "HTTPS", value: 3 },
];

const DYNAMIC_PROXY_TYPES = [
  { label: "IPIDEA", value: 20 },
  { label: "IPHTML", value: 21 },
  { label: "kookeey", value: 22 },
  { label: "Lumatuo", value: 23 },
];

const PROXY_PROTOCOLS = [
  { label: "SOCKS5", value: 1 },
  { label: "HTTP", value: 2 },
];

const UpdateCloudPhoneModal: React.FC<UpdateCloudPhoneModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [groupID, setGroupID] = useState("");
  const [tagIDs, setTagIDs] = useState("");

  // Proxy state
  const [proxyMode, setProxyMode] = useState<"saved" | "static" | "dynamic">(
    "saved",
  );
  const [proxyId, setProxyId] = useState<string>("");

  // Static Proxy State
  const [staticTypeId, setStaticTypeId] = useState<number>(1);
  const [staticServer, setStaticServer] = useState("");
  const [staticPort, setStaticPort] = useState<number | "">("");
  const [staticUsername, setStaticUsername] = useState("");
  const [staticPassword, setStaticPassword] = useState("");

  // Dynamic Proxy State
  const [dynamicTypeId, setDynamicTypeId] = useState<number>(20);
  const [dynamicProtocol, setDynamicProtocol] = useState<number>(1);
  const [dynamicLocation, setDynamicLocation] = useState(""); // Maps to country/region?
  // The API has country, region, city. CreateModal has single input "Location".
  // I will assume "Location" maps to "country" or allow user to enter string.
  // The user prompt example has `country: "us"`.
  // I'll stick to a single "Country" field for now to match CreateModal simplicity or maybe splitting if needed.
  // Prompt says: country No, region No, city No.
  // I'll add "Country", "Region", "City" inputs for better control if Dynamic is selected.
  const [dynamicCountry, setDynamicCountry] = useState("");
  const [dynamicRegion, setDynamicRegion] = useState("");
  const [dynamicCity, setDynamicCity] = useState("");

  const [isManageProxiesOpen, setIsManageProxiesOpen] = useState(false);
  const [error, setError] = useState("");

  const { mutateAsync: updatePhone, isPending } = useUpdateCloudPhone();
  const { data: proxiesData } = useGetProxies({ page: 1, limit: 100 });

  useEffect(() => {
    if (data) {
      setName(data.serialName || "");
      setRemark(data.geelark?.[0]?.remark || "");
      setGroupID(data.geelark?.[0]?.group?.id || "");
      setTagIDs(data.geelark?.[0]?.tags?.map((t) => t.name).join(", ") || "");

      // Proxy
      // If we could detect proxy type from existing data, we would set it.
      // But for now default to 'saved' empty.
      setProxyMode("saved");
      setProxyId("");
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setError("");

    if (data.status === "Starting") {
      Swal.fire(
        "Warning",
        "Cannot update cloud phone while it is starting",
        "warning",
      );
      return;
    }

    const dto: UpdateCloudPhoneDto = {
      id: data.id,
      name: name,
      remark: remark,
      groupID: groupID || undefined,
      tagIDs: tagIDs ? tagIDs.split(",").map((t) => t.trim()) : undefined,
    };

    if (proxyMode === "saved" && proxyId) {
      dto.proxyId = proxyId;
    } else if (proxyMode === "static") {
      if (!staticServer || !staticPort || !staticUsername || !staticPassword) {
        setError("All static proxy fields are required");
        return;
      }
      dto.proxyConfig = {
        typeId: staticTypeId,
        server: staticServer,
        port: Number(staticPort),
        username: staticUsername,
        password: staticPassword,
      };
    } else if (proxyMode === "dynamic") {
      dto.proxyConfig = {
        typeId: dynamicTypeId,
        useProxyCfg: true,
        protocol: dynamicProtocol,
        country: dynamicCountry || undefined,
        region: dynamicRegion || undefined,
        city: dynamicCity || undefined,
      };
    }

    try {
      await updatePhone(dto);
      Swal.fire("Success", "Cloud phone updated successfully", "success");
      onClose();
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to update cloud phone");
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Update Cloud Phone
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Remark
            </label>
            <textarea
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group ID
            </label>
            <input
              type="text"
              value={groupID}
              onChange={(e) => setGroupID(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagIDs}
              onChange={(e) => setTagIDs(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Proxy Configuration
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center dark:text-gray-300">
                <input
                  type="radio"
                  name="proxyMode"
                  value="saved"
                  checked={proxyMode === "saved"}
                  onChange={() => setProxyMode("saved")}
                  className="mr-2"
                />
                Saved Proxy
              </label>
              <label className="flex items-center dark:text-gray-300">
                <input
                  type="radio"
                  name="proxyMode"
                  value="static"
                  checked={proxyMode === "static"}
                  onChange={() => setProxyMode("static")}
                  className="mr-2"
                />
                Static Proxy
              </label>
              <label className="flex items-center dark:text-gray-300">
                <input
                  type="radio"
                  name="proxyMode"
                  value="dynamic"
                  checked={proxyMode === "dynamic"}
                  onChange={() => setProxyMode("dynamic")}
                  className="mr-2"
                />
                Dynamic Proxy
              </label>
            </div>
          </div>

          {proxyMode === "saved" && (
            <div className="col-span-1 md:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Proxy
                </label>
                <button
                  type="button"
                  onClick={() => setIsManageProxiesOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400"
                >
                  Manage Proxies
                </button>
              </div>
              {proxiesData?.data?.length ? (
                <Dropdown
                  value={proxyId}
                  onChange={(e) => setProxyId(e.value)}
                  options={proxiesData.data}
                  optionValue="id"
                  optionLabel="server"
                  placeholder="Select a proxy"
                  filter
                  filterBy="server,data.outboundIP,serialNo"
                  filterMatchMode="contains"
                  className="w-full"
                  showClear
                  itemTemplate={(
                    option: ProxyItem & { data: CheckProxyResponseData },
                  ) => (
                    <div className="flex flex-col">
                      <span className="font-bold">
                        {option.data?.outboundIP || option.server} (
                        {option.serialNo})
                      </span>
                      {option.data && (
                        <div className="text-xs text-gray-500">
                          {option.data.countryCode} - {option.data.countryName}
                        </div>
                      )}
                    </div>
                  )}
                  pt={{
                    root: {
                      className:
                        "w-full rounded-md border border-gray-300 bg-white text-gray-700",
                    },
                    input: {
                      className:
                        "w-full p-2 text-sm focus:outline-none bg-transparent",
                    },
                    panel: { className: "bg-white border" },
                    item: { className: "p-2 cursor-pointer hover:bg-gray-100" },
                  }}
                />
              ) : (
                <div className="text-sm text-gray-500">
                  No saved proxies available.
                </div>
              )}
            </div>
          )}

          {proxyMode === "static" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={staticTypeId}
                  onChange={(e) => setStaticTypeId(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {STATIC_PROXY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Server
                </label>
                <input
                  type="text"
                  required
                  value={staticServer}
                  onChange={(e) => setStaticServer(e.target.value)}
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
                  value={staticPort}
                  onChange={(e) => setStaticPort(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={staticUsername}
                  onChange={(e) => setStaticUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="text"
                  required
                  value={staticPassword}
                  onChange={(e) => setStaticPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}

          {proxyMode === "dynamic" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select
                  value={dynamicTypeId}
                  onChange={(e) => setDynamicTypeId(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {DYNAMIC_PROXY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Protocol
                </label>
                <select
                  value={dynamicProtocol}
                  onChange={(e) => setDynamicProtocol(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {PROXY_PROTOCOLS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. us"
                  value={dynamicCountry}
                  onChange={(e) => setDynamicCountry(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. alabama"
                  value={dynamicRegion}
                  onChange={(e) => setDynamicRegion(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. mobile"
                  value={dynamicCity}
                  onChange={(e) => setDynamicCity(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </>
          )}

          {error && (
            <div className="col-span-1 rounded-md bg-red-50 p-2 text-sm text-red-500 md:col-span-2">
              {error}
            </div>
          )}

          <div className="col-span-1 mt-6 flex justify-end gap-2 md:col-span-2">
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
              {isPending ? "Updating..." : "Update"}
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

export default UpdateCloudPhoneModal;
