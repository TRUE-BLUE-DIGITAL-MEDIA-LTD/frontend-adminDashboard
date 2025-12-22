import React, { useState, useEffect } from "react";
import { CloudPhoneWithDetails } from "../../models/cloud-phone.model";
import { useGetGps, useSetGps } from "../../react-query/cloud-phone";
import Swal from "sweetalert2";

interface GpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CloudPhoneWithDetails | null;
}

const GpsModal: React.FC<GpsModalProps> = ({ isOpen, onClose, data }) => {
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync: getGps } = useGetGps();
  const { mutateAsync: setGps } = useSetGps();

  useEffect(() => {
    if (isOpen && data) {
      setLatitude("");
      setLongitude("");
      fetchGps();
    }
  }, [isOpen, data]);

  const fetchGps = async () => {
    if (!data) return;
    setIsLoading(true);
    try {
      const res = await getGps({ ids: [data.id] });
      if (res.list && res.list.length > 0) {
        setLatitude(res.list[0].latitude);
        setLongitude(res.list[0].longitude);
      }
    } catch (error) {
      console.error("Failed to fetch GPS", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    try {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lon)) {
        Swal.fire("Error", "Invalid coordinates", "error");
        return;
      }

      await setGps({
        list: [
          {
            id: data.id,
            latitude: lat,
            longitude: lon,
          },
        ],
      });
      Swal.fire("Success", "GPS updated successfully", "success");
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update GPS", "error");
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          GPS Settings
        </h2>
        {isLoading ? (
          <div className="text-center text-gray-500">Loading GPS...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
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
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
              >
                Update GPS
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GpsModal;
