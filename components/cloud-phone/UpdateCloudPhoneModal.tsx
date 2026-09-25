import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useState } from "react";
import { FaAndroid, FaApple } from "react-icons/fa";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdRefresh,
} from "react-icons/md";
import Swal from "sweetalert2";
import {
  CheckProxyResponseData,
  CloudPhoneWithDetails,
  ProxyItem,
  UpdateCloudPhoneDto,
} from "../../models/cloud-phone.model";
import {
  useGetGps,
  useGetProxies,
  useSetGps,
  useUpdateCloudPhone,
} from "../../react-query/cloud-phone";
import ManageProxiesModal from "./ManageProxiesModal";

interface UpdateCloudPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CloudPhoneWithDetails | null;
}

const PROXY_TYPES = [
  { label: "SOCKS5", value: 1 },
  { label: "HTTP", value: 2 },
  { label: "HTTPS", value: 3 },
];

const IP_QUERY_CHANNELS = [
  { label: "ip-api", value: "ip-api" },
  { label: "ip2location", value: "ip2location" },
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
    <div className="border-b border-line py-4 last:border-0">
      <button
        type="button"
        className="-mx-2 flex w-full items-center justify-between rounded px-2 py-2 text-left font-medium text-fg transition-colors hover:bg-hover"
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
    <div className="flex w-max rounded-full bg-panel-raised p-1">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          disabled={opt.disabled}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            value === opt.value
              ? "bg-panel text-blue-600 shadow-sm ring-1 ring-line-strong"
              : "text-fg-muted hover:text-fg-muted disabled:cursor-not-allowed disabled:opacity-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const UpdateCloudPhoneModal: React.FC<UpdateCloudPhoneModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  // Profile Settings
  const [name, setName] = useState("");
  const [remark, setRemark] = useState("");
  const [osType, setOsType] = useState<"android" | "ios">("android");

  // Proxy Settings
  const [proxyMode, setProxyMode] = useState<"saved" | "custom">("saved");
  const [proxyId, setProxyId] = useState<string>("");

  // Custom Proxy State
  const [customType, setCustomType] = useState<number>(2); // Default HTTP
  const [server, setServer] = useState("");
  const [port, setPort] = useState<number | "">("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Geolocation (Device Info / Custom)
  const [geoMode, setGeoMode] = useState<"ip" | "custom">("ip");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Advanced Settings State (New)
  const [networkType, setNetworkType] = useState<"wifi" | "cellular">("wifi");
  const [phoneNumberMode, setPhoneNumberMode] = useState<"auto" | "custom">(
    "auto",
  );
  const [customPhoneNumber, setCustomPhoneNumber] = useState("");
  const [deviceNameMode, setDeviceNameMode] = useState<"auto" | "custom">(
    "auto",
  );
  const [customDeviceName, setCustomDeviceName] = useState("");
  const [languageMode, setLanguageMode] = useState<"ip" | "custom">("ip");
  const [customLanguage, setCustomLanguage] = useState(
    "English (United States)",
  );

  const [isManageProxiesOpen, setIsManageProxiesOpen] = useState(false);
  const [error, setError] = useState("");

  const { mutateAsync: updatePhone, isPending: isUpdatePending } =
    useUpdateCloudPhone();
  const { mutateAsync: setGps, isPending: isGpsPending } = useSetGps();
  const getGPS = useGetGps({
    id: data ? data.id : "",
  });
  const { data: proxiesData } = useGetProxies({ page: 1, limit: 100 });

  useEffect(() => {
    if (data) {
      setName(data.serialName || "");
      setRemark(data.geelark?.[0]?.remark || "");

      // Determine Proxy Mode
      if (data.geelark?.[0]?.proxy?.type) {
        setProxyMode("saved");
        // Note: Actual logic to set proxyId from saved proxy data is difficult without matching ID
      }

      // Populate Advanced Settings from data if available
      // Note: Most of these fields are not directly updatable via the current DTO but we populate for UI consistency
      const equip = data.geelark?.[0]?.equipmentInfo;
      if (equip) {
        if (equip.phoneNumber) {
          setPhoneNumberMode("custom");
          setCustomPhoneNumber(equip.phoneNumber);
        }
        if (equip.deviceBrand || equip.deviceModel) {
          setDeviceNameMode("custom");
          setCustomDeviceName(
            `${equip.deviceBrand || ""} ${equip.deviceModel || ""}`.trim(),
          );
        }
        // Network type infer?
        // Language infer?
      }
    }
  }, [data]);

  useEffect(() => {
    if (getGPS.data?.data) {
      setLatitude(getGPS.data.data.list[0].latitude.toString());
      setLongitude(getGPS.data.data.list[0].longitude.toString());
      setGeoMode("custom");
    } else {
      setGeoMode("ip");
    }
  }, [getGPS.data]);

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
    };

    if (proxyMode === "saved" && proxyId) {
      dto.proxyId = proxyId;
    } else if (proxyMode === "custom") {
      if (!server || !port || !username || !password) {
        setError("All custom proxy fields are required");
        return;
      }
      dto.proxyConfig = {
        typeId: customType,
        server: server,
        port: Number(port),
        username: username,
        password: password,
      };
    }

    try {
      await updatePhone(dto);

      if (geoMode === "custom" && latitude && longitude) {
        await setGps({
          list: [
            {
              id: data.id,
              latitude: Number(latitude),
              longitude: Number(longitude),
            },
          ],
        });
      }

      Swal.fire("Success", "Cloud phone updated successfully", "success");
      onClose();
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to update cloud phone");
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-surface bg-opacity-50 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-panel p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-fg">Edit proxy</h2>
          <button
            onClick={onClose}
            className="text-fg-muted hover:text-fg-muted"
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
          {/* Profile Settings */}
          <Section title="Profile settings">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Serial No */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Serial no.
                </label>
                <div className="flex items-center">
                  <span className="rounded bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600">
                    {data.serialNo}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    className="block w-full rounded-full border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-fg-subtle">
                    {name.length} / 100
                  </span>
                </div>
              </div>

              {/* Operating System */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
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

              {/* Remarks */}
              <div className="col-span-1 md:col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Remarks
                </label>
                <div className="relative">
                  <textarea
                    rows={1}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Please enter remarks"
                    maxLength={1500}
                    className="block w-full resize-none overflow-hidden rounded-2xl border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ minHeight: "38px" }}
                  />
                  <span className="absolute bottom-2 right-4 text-xs text-fg-subtle">
                    {remark.length} / 1500
                  </span>
                </div>
              </div>
            </div>
          </Section>

          {/* Proxy Settings */}
          <Section title="Proxy settings">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1 md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-fg-muted">
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

              {proxyMode === "saved" && (
                <div className="col-span-1 flex items-center gap-4 md:col-span-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-fg-muted">
                      Select proxy
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        {proxiesData?.data?.length ? (
                          <Dropdown
        panelClassName="oxy-overlay-panel"
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
                              option: ProxyItem & {
                                data: CheckProxyResponseData;
                              },
                            ) => (
                              <div className="flex flex-col">
                                <span className="font-bold">
                                  {option.data?.outboundIP || option.server} (
                                  {option.serialNo})
                                </span>
                                {option.data && (
                                  <div className="text-xs text-fg-muted">
                                    {option.data.countryCode} -{" "}
                                    {option.data.countryName}
                                  </div>
                                )}
                              </div>
                            )}
                            pt={{
                              root: {
                                className:
                                  "w-full rounded-full border border-line bg-panel text-fg-muted",
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
                                  "bg-panel border shadow-lg rounded-lg mt-1",
                              },
                              item: {
                                className:
                                  "p-2 cursor-pointer hover:bg-hover",
                              },
                            }}
                          />
                        ) : (
                          <div className="p-2 text-sm text-fg-muted">
                            No saved proxies available.
                          </div>
                        )}
                      </div>

                      {/* Shuffle Button (Visual only as per requirement to look like image) */}
                      <button
                        type="button"
                        className="rounded-full p-2 text-blue-500 hover:bg-blue-500/10"
                      >
                        <MdRefresh size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {proxyMode === "custom" && (
                <>
                  {/* Custom Proxy Fields - Kept mostly same but improved layout if needed */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-fg-muted">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={customType}
                      onChange={(e) => setCustomType(Number(e.target.value))}
                      className="block w-full rounded-full border border-line bg-panel px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {PROXY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* ... other custom fields omitted for brevity, adding back if needed. 
                      Since user wants "Saved" view specifically to match image, 
                      I will include key custom fields to ensure functionality is not lost. 
                  */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-fg-muted">
                      Server : Port
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Server IP/Host"
                        value={server}
                        onChange={(e) => setServer(e.target.value)}
                        className="block w-full flex-grow rounded-full border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="flex items-center text-fg-muted">:</span>
                      <input
                        type="number"
                        placeholder="Port"
                        value={port}
                        onChange={(e) => setPort(Number(e.target.value))}
                        className="block w-24 rounded-full border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-sm font-medium text-fg-muted">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full rounded-full border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-sm font-medium text-fg-muted">
                      Password
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-full border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </Section>

          {/* Device Information */}
          <Section title="Device information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1 md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Charging method
                </label>
                <SegmentedControl
                  options={[
                    { label: "Pay per minute", value: "pay-per-minute" },
                    { label: "Monthly rental", value: "monthly" },
                  ]}
                  value={"pay-per-minute"}
                  onChange={() => {}}
                />
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Version
                </label>
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                  {data.geelark?.[0]?.equipmentInfo?.osVersion || "Android 12"}
                </span>
              </div>

              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Location
                </label>
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                  {data.countryName || "USA"}
                </span>
              </div>
            </div>
          </Section>

          {/* Advanced Settings */}
          <Section title="Advanced settings" defaultOpen={true}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Network */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Network
                </label>
                <SegmentedControl
                  options={[
                    { label: "Wi-Fi", value: "wifi" },
                    { label: "Cellular network", value: "cellular" },
                  ]}
                  value={networkType}
                  onChange={setNetworkType}
                />
              </div>

              {/* Phone Number */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Phone number
                </label>
                <div className="flex items-center gap-2">
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
                      value={customPhoneNumber}
                      onChange={(e) => setCustomPhoneNumber(e.target.value)}
                      className="w-full rounded-full border border-line px-4 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="Enter number"
                    />
                  )}
                </div>
              </div>

              {/* Device Name */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Device name
                </label>
                <div className="flex flex-col gap-2">
                  <SegmentedControl
                    options={[
                      { label: "Auto-generated", value: "auto" },
                      { label: "Custom", value: "custom" },
                    ]}
                    value={deviceNameMode}
                    onChange={setDeviceNameMode}
                  />
                  {deviceNameMode === "custom" && (
                    <input
                      type="text"
                      value={customDeviceName}
                      onChange={(e) => setCustomDeviceName(e.target.value)}
                      className="w-full rounded-full border border-line px-4 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="Enter device name"
                    />
                  )}
                </div>
              </div>

              {/* Cloud phone language */}
              <div className="col-span-1">
                <label className="mb-1 block text-sm font-medium text-fg-muted">
                  Cloud phone language
                </label>
                <div className="flex flex-col gap-2">
                  <SegmentedControl
                    options={[
                      { label: "Based on IP", value: "ip" },
                      { label: "Custom", value: "custom" },
                    ]}
                    value={languageMode}
                    onChange={setLanguageMode}
                  />
                  {languageMode === "custom" && (
                    <div className="mt-2">
                      <label className="mb-1 block text-sm font-medium text-fg-muted">
                        Language
                      </label>
                      <select
                        value={customLanguage}
                        onChange={(e) => setCustomLanguage(e.target.value)}
                        className="w-full rounded-full border border-line bg-panel px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option>English (United States)</option>
                        <option>English (United Kingdom)</option>
                        <option>Chinese (Simplified)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {error && (
            <div className="rounded-md bg-red-500/10 p-2 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-panel-raised px-6 py-2 text-sm font-medium text-fg-muted hover:bg-hover focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdatePending || isGpsPending}
              className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {isUpdatePending || isGpsPending ? "Saving..." : "OK"}
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
