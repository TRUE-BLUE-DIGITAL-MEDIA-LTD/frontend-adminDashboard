import React from "react";
import { CloudPhoneWithDetails } from "../../models/cloud-phone.model";
import {
  FaPlay,
  FaStop,
  FaTrash,
  FaEdit,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Image from "next/image";
import { countries } from "../../data/country";

interface CloudPhoneCardProps {
  data: CloudPhoneWithDetails;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (data: CloudPhoneWithDetails) => void;
  onGps: (data: CloudPhoneWithDetails) => void;
  isStarting?: boolean;
  isStopping?: boolean;
  isDeleting?: boolean;
}

const CloudPhoneCard: React.FC<CloudPhoneCardProps> = ({
  data,
  onStart,
  onStop,
  onDelete,
  onUpdate,
  onGps,
  isStarting,
  isStopping,
  isDeleting,
}) => {
  const details = data.geelark?.[0];
  const equipment = details?.equipmentInfo;
  const proxy = details?.proxy;
  const countryInfo = countries.find((a) => a.country === data.countryName);
  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-panel p-6 shadow-md dark:border-line-strong">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <h3
            className="truncate text-lg font-bold text-fg"
            title={data.serialName}
          >
            {data.serialName}
          </h3>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              data.status === "Started" || data.status === "Starting"
                ? "bg-green-500/15 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-panel-raised text-fg dark:text-fg-subtle"
            }`}
          >
            {data.status}
          </span>
        </div>

        <div className="mb-4 space-y-3 text-sm text-fg-muted dark:text-fg-subtle">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="col-span-2 flex justify-between border-b border-line pb-1 dark:border-line-strong">
              <span className="font-medium text-fg-muted dark:text-fg-subtle">
                Serial No:
              </span>
              <span>{data.serialNo}</span>
            </div>

            <div className="col-span-2 mt-2">
              <span className="block font-medium text-fg-muted dark:text-fg-subtle">
                Device Info
              </span>
              <div className="ml-2 text-xs">
                <p>
                  {equipment?.deviceBrand} {equipment?.deviceModel}
                </p>
                <p className="text-fg-muted">{equipment?.osVersion}</p>
                <p>IMEI: {data.imei || equipment?.imei || "N/A"}</p>
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <span className="block font-medium text-fg-muted dark:text-fg-subtle">
                Network & Location
              </span>
              <div className="ml-2 text-xs">
                <p>
                  Phone: {data.phoneNumber || equipment?.phoneNumber || "N/A"}
                </p>
                <p className="flex gap-2">
                  Country: {data.countryName || equipment?.countryName || "N/A"}
                  {countryInfo && (
                    <div className="relative h-5 w-5">
                      <Image src={countryInfo.flag} fill alt="country flag" />
                    </div>
                  )}
                </p>
                <p>Timezone: {data.timeZone || equipment?.timeZone || "N/A"}</p>
              </div>
            </div>

            {proxy && (
              <div className="col-span-2 mt-2">
                <span className="block font-medium text-fg-muted dark:text-fg-subtle">
                  Proxy
                </span>
                <div
                  className="ml-2 truncate text-xs"
                  title={`${proxy.server}:${proxy.port}`}
                >
                  {proxy.type}://{proxy.server}:{proxy.port}
                </div>
              </div>
            )}

            {(equipment?.wifiBssid || equipment?.mac) && (
              <div className="col-span-2 mt-2">
                <span className="block font-medium text-fg-muted dark:text-fg-subtle">
                  Hardware
                </span>
                <div className="ml-2 text-xs text-fg-subtle">
                  {equipment?.wifiBssid && <p>WiFi: {equipment.wifiBssid}</p>}
                  {equipment?.mac && <p>MAC: {equipment.mac}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4 dark:border-line-strong">
        {data.status === "Started" || data.status === "Starting" ? (
          <button
            onClick={() => onStop(data.id)}
            disabled={isStopping}
            className={`rounded-full p-2 text-red-500 transition-colors hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-900/30 ${isStopping ? "cursor-not-allowed opacity-50" : ""}`}
            title="Stop"
          >
            <FaStop className={isStopping ? "animate-pulse" : ""} />
          </button>
        ) : (
          <button
            onClick={() => onStart(data.id)}
            disabled={isStarting}
            className={`rounded-full p-2 text-green-600 transition-colors hover:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-900/30 ${isStarting ? "cursor-not-allowed opacity-50" : ""}`}
            title="Start"
          >
            <FaPlay className={isStarting ? "animate-pulse" : ""} />
          </button>
        )}
        <button
          onClick={() => onGps(data)}
          className="rounded-full p-2 text-blue-500 transition-colors hover:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-900/30"
          title="GPS"
        >
          <FaMapMarkerAlt />
        </button>
        <button
          onClick={() => onUpdate(data)}
          className="rounded-full p-2 text-yellow-500 transition-colors hover:bg-yellow-500/10 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
          title="Edit"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(data.id)}
          disabled={isDeleting}
          className={`rounded-full p-2 text-fg-muted transition-colors hover:bg-hover dark:text-fg-subtle ${isDeleting ? "cursor-not-allowed opacity-50" : ""}`}
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default CloudPhoneCard;
