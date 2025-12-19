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
import { countries } from "../../data/country";

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

const DYNAMIC_PROXY_TYPES = [
  "IPIDEA",
  "IPHTML",
  "kookeey",
  "Luminati(BrightData)",
  "rolaip",
  "Proxyma",
  "DECODO",
  "NodeMaven",
  "IPIDEAMobile",
  "kookeeyMobile",
];

const NET_TYPES = [
  { label: "Wi-Fi", value: 0 },
  { label: "Mobile", value: 1 },
];

const CreateCloudPhoneModal: React.FC<CreateCloudPhoneModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [profileName, setProfileName] = useState("");
  const [mobileType, setMobileType] = useState<MobileType>("Android 10");
  const [proxyNumber, setProxyNumber] = useState<number | "">("");

  // New Fields
  const [region, setRegion] = useState("");
  const [proxyInformation, setProxyInformation] = useState("");
  const [refreshUrl, setRefreshUrl] = useState("");
  const [dynamicProxy, setDynamicProxy] = useState("");
  const [dynamicProxyLocation, setDynamicProxyLocation] = useState("");
  const [mobileLanguage, setMobileLanguage] = useState("");
  const [profileGroup, setProfileGroup] = useState("");
  const [profileTags, setProfileTags] = useState("");
  const [profileNote, setProfileNote] = useState("");
  const [surfaceBrandName, setSurfaceBrandName] = useState("");
  const [surfaceModelName, setSurfaceModelName] = useState("");
  const [netType, setNetType] = useState<number | "">("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [proxyMode, setProxyMode] = useState<"saved" | "custom">("saved");

  const [isManageProxiesOpen, setIsManageProxiesOpen] = useState(false);

  const { mutate: createCloudPhone, isPending } = useCreateCloudPhone();
  const { data: proxiesData } = useGetProxies({ page: 1, limit: 100 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) return;
    setError("");

    createCloudPhone(
      {
        profileName,
        mobileType,
        proxyNumber:
          proxyMode === "saved" && proxyNumber !== ""
            ? Number(proxyNumber)
            : undefined,
        region: region || undefined,
        proxyInformation:
          proxyMode === "custom" ? proxyInformation || undefined : undefined,
        refreshUrl:
          proxyMode === "custom" ? refreshUrl || undefined : undefined,
        dynamicProxy:
          proxyMode === "custom" ? dynamicProxy || undefined : undefined,
        dynamicProxyLocation:
          proxyMode === "custom"
            ? dynamicProxyLocation || undefined
            : undefined,
        mobileLanguage: mobileLanguage || undefined,
        profileGroup: profileGroup || undefined,
        profileTags: profileTags
          ? profileTags.split(",").map((t) => t.trim())
          : undefined,
        profileNote: profileNote || undefined,
        surfaceBrandName: surfaceBrandName || undefined,
        surfaceModelName: surfaceModelName || undefined,
        netType: netType === "" ? undefined : Number(netType),
        phoneNumber: phoneNumber || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setProfileName("");
          setMobileType("Android 10");
          setProxyNumber("");
          setRegion("");
          setProxyInformation("");
          setRefreshUrl("");
          setDynamicProxy("");
          setDynamicProxyLocation("");
          setMobileLanguage("");
          setProfileGroup("");
          setProfileTags("");
          setProfileNote("");
          setSurfaceBrandName("");
          setSurfaceModelName("");
          setNetType("");
          setPhoneNumber("");
          setError("");
          setProxyMode("saved");
        },
        onError: (err: any) => {
          setError(err.message || "Failed to create cloud phone");
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Create Cloud Phone
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Name <span className="text-red-500">*</span>
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
              Mobile Type <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Region</option>
              {countries.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.country}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Proxy Configuration
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
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
              <label className="flex items-center">
                <input
                  type="radio"
                  name="proxyMode"
                  value="custom"
                  checked={proxyMode === "custom"}
                  onChange={() => setProxyMode("custom")}
                  className="mr-2"
                />
                Custom Proxy
              </label>
            </div>
          </div>

          {proxyMode === "saved" && (
            <div className="col-span-1 md:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Proxy Number
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
                  showClear
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
                  placeholder="Enter Proxy Number"
                  value={proxyNumber}
                  onChange={(e) =>
                    setProxyNumber(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a proxy or enter proxy serial number.
              </p>
            </div>
          )}

          {proxyMode === "custom" && (
            <>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Proxy Information
                </label>
                <input
                  type="text"
                  placeholder="socks5://user:pass@host:port"
                  value={proxyInformation}
                  onChange={(e) => setProxyInformation(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Refresh URL
                </label>
                <input
                  type="text"
                  placeholder="http://..."
                  value={refreshUrl}
                  onChange={(e) => setRefreshUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dynamic Proxy
                </label>
                <select
                  value={dynamicProxy}
                  onChange={(e) => setDynamicProxy(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Dynamic Proxy</option>
                  {DYNAMIC_PROXY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dynamic Proxy Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. us"
                  value={dynamicProxyLocation}
                  onChange={(e) => setDynamicProxyLocation(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mobile Language
            </label>
            <input
              type="text"
              placeholder="e.g. default"
              value={mobileLanguage}
              onChange={(e) => setMobileLanguage(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Group
            </label>
            <input
              type="text"
              value={profileGroup}
              onChange={(e) => setProfileGroup(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="tag1, tag2"
              value={profileTags}
              onChange={(e) => setProfileTags(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Note
            </label>
            <textarea
              rows={2}
              value={profileNote}
              onChange={(e) => setProfileNote(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Surface Brand Name
            </label>
            <input
              type="text"
              value={surfaceBrandName}
              onChange={(e) => setSurfaceBrandName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Surface Model Name
            </label>
            <input
              type="text"
              value={surfaceModelName}
              onChange={(e) => setSurfaceModelName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Net Type
            </label>
            <select
              value={netType}
              onChange={(e) =>
                setNetType(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Default</option>
              {NET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="col-span-1 rounded-md bg-red-50 p-2 text-sm text-red-500 md:col-span-2">
              {error}
            </div>
          )}

          <div className="col-span-1 mt-6 flex justify-end gap-2 md:col-span-2">
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
