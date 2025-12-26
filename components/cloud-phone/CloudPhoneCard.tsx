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
    <div className="flex h-full flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <h3
            className="truncate text-lg font-bold text-gray-900 dark:text-white"
            title={data.serialName}
          >
            {data.serialName}
          </h3>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              data.status === "Started" || data.status === "Starting"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {data.status}
          </span>
        </div>

        <div className="mb-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="col-span-2 flex justify-between border-b border-gray-100 pb-1 dark:border-gray-700">
              <span className="font-medium text-gray-500 dark:text-gray-400">
                Serial No:
              </span>
              <span>{data.serialNo}</span>
            </div>

            <div className="col-span-2 mt-2">
              <span className="block font-medium text-gray-500 dark:text-gray-400">
                Device Info
              </span>
              <div className="ml-2 text-xs">
                <p>
                  {equipment?.deviceBrand} {equipment?.deviceModel}
                </p>
                <p className="text-gray-500">{equipment?.osVersion}</p>
                <p>IMEI: {data.imei || equipment?.imei || "N/A"}</p>
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <span className="block font-medium text-gray-500 dark:text-gray-400">
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
                <span className="block font-medium text-gray-500 dark:text-gray-400">
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
                <span className="block font-medium text-gray-500 dark:text-gray-400">
                  Hardware
                </span>
                <div className="ml-2 text-xs text-gray-400">
                  {equipment?.wifiBssid && <p>WiFi: {equipment.wifiBssid}</p>}
                  {equipment?.mac && <p>MAC: {equipment.mac}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
        {data.status === "Started" || data.status === "Starting" ? (
          <button
            onClick={() => onStop(data.id)}
            disabled={isStopping}
            className={`rounded-full p-2 text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 ${isStopping ? "cursor-not-allowed opacity-50" : ""}`}
            title="Stop"
          >
            <FaStop className={isStopping ? "animate-pulse" : ""} />
          </button>
        ) : (
          <button
            onClick={() => onStart(data.id)}
            disabled={isStarting}
            className={`rounded-full p-2 text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 ${isStarting ? "cursor-not-allowed opacity-50" : ""}`}
            title="Start"
          >
            <FaPlay className={isStarting ? "animate-pulse" : ""} />
          </button>
        )}
        <button
          onClick={() => onGps(data)}
          className="rounded-full p-2 text-blue-500 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
          title="GPS"
        >
          <FaMapMarkerAlt />
        </button>
        <button
          onClick={() => onUpdate(data)}
          className="rounded-full p-2 text-yellow-500 transition-colors hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
          title="Edit"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(data.id)}
          disabled={isDeleting}
          className={`rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 ${isDeleting ? "cursor-not-allowed opacity-50" : ""}`}
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default CloudPhoneCard;
