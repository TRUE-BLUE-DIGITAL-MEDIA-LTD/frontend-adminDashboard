import React, { useState } from "react";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { FaAndroid, FaApple } from "react-icons/fa";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdRefresh,
  MdWarning,
} from "react-icons/md";
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
  { label: "Cellular network", value: 1 },
];

const Section = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4 last:border-0">
      <button
        type="button"
        className="-mx-2 flex w-full items-center justify-between rounded px-2 py-2 text-left font-medium text-gray-900 transition-colors hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
      </button>
      {isOpen && <div className="mt-4 space-y-5 px-1">{children}</div>}
    </div>
  );
};

const SegmentedControl = ({
  options,
  value,
  onChange,
}: {
  options: { label: React.ReactNode; value: any; disabled?: boolean }[];
  value: any;
  onChange: (val: any) => void;
}) => {
  return (
    <div className="flex w-max rounded-full bg-gray-100 p-1">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          disabled={opt.disabled}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            value === opt.value
              ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
              : "text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const CreateCloudPhoneModal: React.FC<CreateCloudPhoneModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Profile Settings
  const [profileName, setProfileName] = useState("");
  const [osType, setOsType] = useState<"android" | "ios">("android");
  const [profileGroup, setProfileGroup] = useState("");
  const [profileTags, setProfileTags] = useState("");
  const [profileNote, setProfileNote] = useState("");

  // Proxy Settings
  const [proxyMode, setProxyMode] = useState<"saved" | "custom">("saved");
  const [proxyType, setProxyType] = useState("noproxy");
  const [proxyNumber, setProxyNumber] = useState<number | "">("");

  // Custom Proxy Fields
  const [proxyInformation, setProxyInformation] = useState("");
  const [refreshUrl, setRefreshUrl] = useState("");
  const [dynamicProxy, setDynamicProxy] = useState("");
  const [dynamicProxyLocation, setDynamicProxyLocation] = useState("");

  // Device Information
  const [chargingMethod, setChargingMethod] = useState<
    "pay-per-minute" | "monthly"
  >("pay-per-minute");
  const [mobileType, setMobileType] = useState<MobileType>("Android 12");

  // Advanced Settings
  const [netType, setNetType] = useState<number>(0); // 0 = Wifi, 1 = Cellular
  const [phoneNumberMode, setPhoneNumberMode] = useState<"auto" | "custom">(
    "auto",
  );
  const [phoneNumber, setPhoneNumber] = useState("");

  const [locationMode, setLocationMode] = useState<"ip" | "custom">("ip");
  const [region, setRegion] = useState(""); // Location custom

  const [brandMode, setBrandMode] = useState<"random" | "custom">("random");
  const [surfaceBrandName, setSurfaceBrandName] = useState("");

  const [modelMode, setModelMode] = useState<"random" | "custom">("random");
  const [surfaceModelName, setSurfaceModelName] = useState("");

  const [deviceNameMode, setDeviceNameMode] = useState<"auto" | "custom">(
    "auto",
  );
  // Assuming profileName acts as device name or separate? Using profileName for now as 'Profile Name' is primary.

  const [languageMode, setLanguageMode] = useState<"ip" | "custom">("ip");
  const [mobileLanguage, setMobileLanguage] = useState("");

  const [error, setError] = useState("");
  const [isManageProxiesOpen, setIsManageProxiesOpen] = useState(false);

  const { mutate: createCloudPhone, isPending } = useCreateCloudPhone();
  const { data: proxiesData } = useGetProxies({ page: 1, limit: 100 });

  const resetForm = () => {
    setProfileName("");
    setOsType("android");
    setProfileGroup("");
    setProfileTags("");
    setProfileNote("");
    setProxyMode("saved");
    setProxyType("noproxy");
    setProxyNumber("");
    setProxyInformation("");
    setRefreshUrl("");
    setDynamicProxy("");
    setDynamicProxyLocation("");
    setChargingMethod("pay-per-minute");
    setMobileType("Android 12");
    setNetType(0);
    setPhoneNumberMode("auto");
    setPhoneNumber("");
    setLocationMode("ip");
    setRegion("");
    setBrandMode("random");
    setSurfaceBrandName("");
    setModelMode("random");
    setSurfaceModelName("");
    setDeviceNameMode("auto");
    setLanguageMode("ip");
    setMobileLanguage("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) {
      setError("Profile name is required");
      return;
    }
    setError("");

    createCloudPhone(
      {
        profileName,
        mobileType,
        proxyNumber:
          proxyMode === "saved" && proxyNumber !== ""
            ? Number(proxyNumber)
            : undefined,
        region: locationMode === "custom" ? region || undefined : undefined,
        proxyInformation:
          proxyMode === "custom" ? proxyInformation || undefined : undefined,
        refreshUrl:
          proxyMode === "custom" ? refreshUrl || undefined : undefined,
        dynamicProxy:
          proxyMode === "custom" ? dynamicProxy || undefined : undefined,
        dynamicProxyLocation:
          locationMode === "custom"
            ? dynamicProxyLocation || undefined
            : undefined,
        mobileLanguage:
          languageMode === "custom" ? mobileLanguage || undefined : undefined,
        profileGroup: profileGroup || undefined,
        profileTags: profileTags
          ? profileTags.split(",").map((t) => t.trim())
          : undefined,
        profileNote: profileNote || undefined,
        surfaceBrandName:
          brandMode === "custom" ? surfaceBrandName || undefined : undefined,
        surfaceModelName:
          modelMode === "custom" ? surfaceModelName || undefined : undefined,
        netType: netType,
        phoneNumber:
          phoneNumberMode === "custom" ? phoneNumber || undefined : undefined,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        },
        onError: (err: any) => {
          setError(err.message || "Failed to create cloud phone");
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Create Cloud Phone
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Section title="Profile settings">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="The profile name is optional"
                    maxLength={100}
                    className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-gray-400">
                    {profileName.length} / 100
                  </span>
                </div>
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Operating system
                </label>
                <SegmentedControl
                  options={[
                    {
                      label: <FaAndroid className="h-5 w-5" />,
                      value: "android",
                    },
                    {
                      label: <FaApple className="h-5 w-5" />,
                      value: "ios",
                      disabled: true,
                    },
                  ]}
                  value={osType}
                  onChange={setOsType}
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Group
                </label>
                <input
                  type="text"
                  value={profileGroup}
                  onChange={(e) => setProfileGroup(e.target.value)}
                  placeholder="Select or enter a group"
                  className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  value={profileTags}
                  onChange={(e) => setProfileTags(e.target.value)}
                  placeholder="Find tag/Create tag"
                  className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={profileNote}
                    onChange={(e) => setProfileNote(e.target.value)}
                    placeholder="Please enter remarks"
                    maxLength={1500}
                    className="block w-full rounded-2xl border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="absolute bottom-2 right-4 text-xs text-gray-400">
                    {profileNote.length} / 1500
                  </span>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Proxy settings">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1 flex items-center gap-6 md:col-span-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Option
                  </label>
                  <SegmentedControl
                    options={[
                      { label: "Custom", value: "custom" },
                      { label: "Saved", value: "saved" },
                    ]}
                    value={proxyMode}
                    onChange={setProxyMode}
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={proxyType}
                    onChange={(e) => setProxyType(e.target.value)}
                    className="block w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="noproxy">No proxy (local network)</option>
                    <option value="http">HTTP</option>
                    <option value="socks5">SOCKS5</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    IP query channel
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="block w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      defaultValue="IP2Location"
                    >
                      <option value="IP2Location">IP2Location</option>
                    </select>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-full border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Check proxy
                    </button>
                  </div>
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
                              {option.data.countryCode} -{" "}
                              {option.data.countryName},{" "}
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
                                {option.server}:{option.port} ({option.serialNo}
                                )
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
                            "w-full rounded-full border border-gray-300 bg-white text-gray-700",
                        },
                        input: {
                          className:
                            "w-full px-4 py-2 text-sm focus:outline-none bg-transparent rounded-full",
                        },
                        trigger: {
                          className:
                            "flex items-center justify-center w-8 pr-2",
                        },
                        panel: {
                          className:
                            "bg-white border shadow-lg rounded-lg mt-1",
                        },
                        item: {
                          className: "p-2 cursor-pointer hover:bg-gray-100",
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
                      className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              )}

              {proxyMode === "custom" && (
                <>
                  <div className="col-span-1 md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Proxy Information
                    </label>
                    <input
                      type="text"
                      placeholder="socks5://user:pass@host:port"
                      value={proxyInformation}
                      onChange={(e) => setProxyInformation(e.target.value)}
                      className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Refresh URL
                    </label>
                    <input
                      type="text"
                      placeholder="http://..."
                      value={refreshUrl}
                      onChange={(e) => setRefreshUrl(e.target.value)}
                      className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Dynamic Proxy
                    </label>
                    <select
                      value={dynamicProxy}
                      onChange={(e) => setDynamicProxy(e.target.value)}
                      className="block w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Dynamic Proxy Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. us"
                      value={dynamicProxyLocation}
                      onChange={(e) => setDynamicProxyLocation(e.target.value)}
                      className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </Section>

          <Section title="Device information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Charging method
                </label>
                <SegmentedControl
                  options={[
                    { label: "Pay per minute", value: "pay-per-minute" },
                    { label: "Monthly rental", value: "monthly" },
                  ]}
                  value={chargingMethod}
                  onChange={setChargingMethod}
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Version
                </label>
                <select
                  value={mobileType}
                  onChange={(e) => setMobileType(e.target.value as MobileType)}
                  className="block w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {MOBILE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Section>

          <Section title="Advanced settings" defaultOpen={false}>
            <div className="space-y-6">
              {/* Network */}
              <div className="flex flex-col md:flex-row md:items-center">
                <label className="mb-2 w-48 text-sm font-medium text-gray-700 md:mb-0">
                  Network
                </label>
                <SegmentedControl
                  options={NET_TYPES}
                  value={netType}
                  onChange={setNetType}
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col md:flex-row md:items-start">
                <label className="mb-2 w-48 pt-2 text-sm font-medium text-gray-700 md:mb-0">
                  Phone number
                </label>
                <div className="flex-1 space-y-3">
                  <SegmentedControl
                    options={[
                      { label: "Auto-generated", value: "auto" },
                      { label: "Custom", value: "custom" },
                    ]}
                    value={phoneNumberMode}
                    onChange={setPhoneNumberMode}
                  />
                  {phoneNumberMode === "custom" && (
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      className="block w-full max-w-md rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col md:flex-row md:items-start">
                <label className="mb-2 w-48 pt-2 text-sm font-medium text-gray-700 md:mb-0">
                  Location
                </label>
                <div className="flex-1 space-y-3">
                  <SegmentedControl
                    options={[
                      {
                        label: (
                          <span className="flex items-center gap-1">
                            Based on IP <MdRefresh />
                          </span>
                        ),
                        value: "ip",
                      },
                      { label: "Custom", value: "custom" },
                    ]}
                    value={locationMode}
                    onChange={setLocationMode}
                  />
                  {locationMode === "custom" && (
                    <select
                      value={dynamicProxyLocation}
                      onChange={(e) => setDynamicProxyLocation(e.target.value)}
                      className="block w-full max-w-md rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Region</option>
                      {countries.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.country}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Device Brand */}
              <div className="flex flex-col md:flex-row md:items-start">
                <label className="mb-2 w-48 pt-2 text-sm font-medium text-gray-700 md:mb-0">
                  Device brand
                </label>
                <div className="flex-1 space-y-3">
                  <SegmentedControl
                    options={[
                      { label: "Random", value: "random" },
                      { label: "Custom", value: "custom" },
                    ]}
                    value={brandMode}
                    onChange={setBrandMode}
                  />
                  {brandMode === "custom" && (
                    <input
                      type="text"
                      value={surfaceBrandName}
                      onChange={(e) => setSurfaceBrandName(e.target.value)}
                      className="block w-full max-w-md rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Device Model */}
              <div className="flex flex-col md:flex-row md:items-start">
                <label className="mb-2 w-48 pt-2 text-sm font-medium text-gray-700 md:mb-0">
                  Device model
                </label>
                <div className="flex-1 space-y-3">
                  <SegmentedControl
                    options={[
                      { label: "Random", value: "random" },
                      { label: "Custom", value: "custom" },
                    ]}
                    value={modelMode}
                    onChange={setModelMode}
                  />
                  {modelMode === "custom" && (
                    <input
                      type="text"
                      value={surfaceModelName}
                      onChange={(e) => setSurfaceModelName(e.target.value)}
                      className="block w-full max-w-md rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Device Name */}
              <div className="flex flex-col md:flex-row md:items-start">
                <label className="mb-2 w-48 pt-2 text-sm font-medium text-gray-700 md:mb-0">
                  Device name
                </label>
                <div className="flex-1 space-y-3">
                  <SegmentedControl
                    options={[
                      { label: "Auto-generated", value: "auto" },
                      { label: "Custom", value: "custom" },
                    ]}
                    value={deviceNameMode}
                    onChange={setDeviceNameMode}
                  />
                </div>
              </div>

              {/* Cloud Phone Language */}
              <div className="flex flex-col md:flex-row md:items-start">
                <label className="mb-2 w-48 pt-2 text-sm font-medium text-gray-700 md:mb-0">
                  Cloud phone language
                </label>
                <div className="flex-1 space-y-3">
                  <SegmentedControl
                    options={[
                      { label: "Based on IP", value: "ip" },
                      { label: "Custom", value: "custom" },
                    ]}
                    value={languageMode}
                    onChange={setLanguageMode}
                  />
                  {languageMode === "custom" && (
                    <input
                      type="text"
                      value={mobileLanguage}
                      onChange={(e) => setMobileLanguage(e.target.value)}
                      placeholder="English (United States)"
                      className="block w-full max-w-md rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </Section>

          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Confirm"}
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
