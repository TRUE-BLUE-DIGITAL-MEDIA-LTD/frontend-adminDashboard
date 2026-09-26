import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useState } from "react";
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

interface ChangeProxyModalProps {
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

const ChangeProxyModal: React.FC<ChangeProxyModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [proxyMode, setProxyMode] = useState<"saved" | "custom">("saved");
  const [proxyId, setProxyId] = useState<string>("");

  // Custom Proxy State
  const [customType, setCustomType] = useState<number>(2); // Default HTTP
  const [ipQueryChannel, setIpQueryChannel] = useState("ip-api");
  const [server, setServer] = useState(data?.geelark?.[0]?.proxy?.server || "");
  const [port, setPort] = useState<number | "">(
    data?.geelark?.[0]?.proxy?.port || "",
  );
  const [username, setUsername] = useState(
    data?.geelark?.[0]?.proxy?.username || "",
  );
  const [password, setPassword] = useState(
    data?.geelark?.[0]?.proxy?.password || "",
  );
  const [changeIpUrl, setChangeIpUrl] = useState("");

  // Geolocation
  const [geoMode, setGeoMode] = useState<"ip" | "custom">("ip");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [isMoreOpen, setIsMoreOpen] = useState(false);
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
      if (data.geelark?.[0]?.proxy?.type) {
        setProxyMode("saved");
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

    const dto: UpdateCloudPhoneDto = {
      id: data.id,
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

      Swal.fire("Success", "Settings updated successfully", "success");
      onClose();
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to update settings");
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-surface bg-opacity-50 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-panel p-6 shadow-2xl">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile No */}
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
            <label className="text-right text-sm font-medium text-fg-muted">
              Profile no.
            </label>
            <div>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600">
                {data.serialNo}
              </span>
            </div>
          </div>

          {/* Option */}
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
            <label className="text-right text-sm font-medium text-fg-muted">
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
            <>
              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
                <label className="text-right text-sm font-medium text-fg-muted">
                  Proxy group
                </label>
                {/* Mock Group Dropdown as per image */}
                <div className="w-full">
                  <select
                    className="w-full rounded-full border border-line bg-panel px-4 py-2 text-sm text-fg-muted focus:border-blue-500 focus:outline-none"
                    disabled
                  >
                    <option>Ungrouped proxies</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[120px_1fr]">
                <label className="mt-2 text-right text-sm font-medium text-fg-muted">
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
                            className: "p-2 cursor-pointer hover:bg-hover",
                          },
                        }}
                      />
                    ) : (
                      <div className="p-2 text-sm text-fg-muted">
                        No saved proxies available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {proxyMode === "custom" && (
            <>
              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
                <label className="text-right text-sm font-medium text-fg-muted">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(Number(e.target.value))}
                  className="block w-full rounded-full border border-line bg-panel px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {PROXY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
                <label className="text-right text-sm font-medium text-fg-muted">
                  IP query channel
                </label>
                <select
                  value={ipQueryChannel}
                  onChange={(e) => setIpQueryChannel(e.target.value)}
                  className="block w-full rounded-full border border-line bg-panel px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {IP_QUERY_CHANNELS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
                <label className="text-right text-sm font-medium text-fg-muted">
                  Server : Port
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Server IP/Host"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="block w-full flex-grow rounded-full border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <span className="flex items-center text-fg-muted">:</span>
                  <input
                    type="number"
                    placeholder="Port"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    className="block w-24 rounded-full border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
                <label className="text-right text-sm font-medium text-fg-muted">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-full border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
                <label className="text-right text-sm font-medium text-fg-muted">
                  Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-full border border-line px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
                <label className="text-right text-sm font-medium text-fg-muted">
                  Change IP URL
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Please enter the change IP URL (optional)"
                    value={changeIpUrl}
                    onChange={(e) => setChangeIpUrl(e.target.value)}
                    className="block w-full rounded-full border border-line px-4 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <MdRefresh className="absolute right-4 top-2.5 h-5 w-5 cursor-pointer text-fg-subtle" />
                </div>
              </div>
            </>
          )}

          {/* Geolocation */}
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
            <label className="text-right text-sm font-medium text-fg-muted">
              Geolocation
            </label>
            <SegmentedControl
              options={[
                { label: "Based on IP", value: "ip" },
                { label: "Custom", value: "custom" },
              ]}
              value={geoMode}
              onChange={setGeoMode}
            />
          </div>

          {/* Lat/Long Row - only if custom? or always show? Image shows it with Custom selected */}
          {geoMode === "custom" && (
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[120px_1fr]">
              <div /> {/* Spacer */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  <span className="text-sm text-fg-muted">Latitude</span>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-32 rounded-full border border-line px-3 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  <span className="text-sm text-fg-muted">Longitude</span>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-32 rounded-full border border-line px-3 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-500/10 p-2 text-center text-sm text-red-500">
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
    </div>
  );
};

export default ChangeProxyModal;
