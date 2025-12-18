import React, { useState } from "react";
import {
  useGetCloudPhones,
  useStartCloudPhone,
  useStopCloudPhone,
  useDeleteCloudPhone,
} from "../../react-query/cloud-phone";
import CloudPhoneCard from "./CloudPhoneCard";
import CreateCloudPhoneModal from "./CreateCloudPhoneModal";
import UpdateCloudPhoneModal from "./UpdateCloudPhoneModal";
import { CloudPhoneWithDetails } from "../../models/cloud-phone.model";
import Swal from "sweetalert2";
import { ErrorMessages } from "@/models";

function CloudPhone() {
  const { data: cloudPhones, isLoading, error } = useGetCloudPhones();
  const { mutateAsync: startPhone, isPending: isStarting } =
    useStartCloudPhone();
  const { mutate: stopPhone, isPending: isStopping } = useStopCloudPhone();
  const { mutateAsync: deletePhone, isPending: isDeleting } =
    useDeleteCloudPhone();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] =
    useState<CloudPhoneWithDetails | null>(null);

  // Track which ID is being operated on
  const [operatingId, setOperatingId] = useState<string | null>(null);

  const handleStart = async (id: string) => {
    setOperatingId(id);

    // 1. Create a temporary "Loading" page so the user doesn't see a white screen
    const loadingHtml = `
    <html>
      <head><title>Opening Phone...</title></head>
      <body style="background: #111; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif;">
        <h3>Connecting to phone...</h3>
      </body>
    </html>
  `;
    const blob = new Blob([loadingHtml], { type: "text/html" });
    const loadingUrl = URL.createObjectURL(blob);

    // 2. Open popup immediately with dimensions.
    // IMPORTANT: Removed 'noopener' and 'noreferrer' so we keep control.
    const newWindow = window.open(loadingUrl, "_blank", "width=430,height=932");

    try {
      console.log("Starting phone request...");
      const response = await startPhone(id);
      console.log("Phone started, URL:", response?.url);

      if (newWindow && response?.url) {
        // 3. Redirect the popup to the actual URL
        newWindow.location.href = response.url;
      } else {
        console.error("Window reference lost or URL missing");
        newWindow?.close();
      }
    } catch (error) {
      console.error("Failed to start phone:", error);
      // 4. If API fails, close the window so user isn't stuck
      newWindow?.close();
    } finally {
      // Clean up the temporary blob URL
      URL.revokeObjectURL(loadingUrl);
      setOperatingId(null);
    }
  };
  const handleStop = (id: string) => {
    setOperatingId(id);
    stopPhone(id, {
      onSettled: () => setOperatingId(null),
    });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setOperatingId(id);
          await deletePhone(id);
          Swal.fire(
            "Deleted!",
            "Your cloud phone has been deleted.",
            "success",
          );
        } catch (error) {
          console.log(error);
          let result = error as ErrorMessages;
          Swal.fire({
            title: result.error ? result.error : "Something went wrong!",
            text: result.message.toString(),
            footer: result.statusCode
              ? "Error code: " + result.statusCode?.toString()
              : "",
            icon: "error",
          });
        } finally {
          setOperatingId(null);
        }
      }
    });
  };

  const handleUpdate = (phone: CloudPhoneWithDetails) => {
    setSelectedPhone(phone);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cloud Phones</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700"
        >
          Create Cloud Phone
        </button>
      </div>

      {isLoading && <div className="py-10 text-center">Loading...</div>}
      {error && (
        <div className="py-10 text-center text-red-500">
          Error loading cloud phones
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cloudPhones?.map((phone) => (
          <CloudPhoneCard
            key={phone.id}
            data={phone}
            onStart={handleStart}
            onStop={handleStop}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            isStarting={isStarting && operatingId === phone.id}
            isStopping={isStopping && operatingId === phone.id}
            isDeleting={isDeleting && operatingId === phone.id}
          />
        ))}
        {!isLoading && cloudPhones?.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">
            No cloud phones found. Create one to get started.
          </div>
        )}
      </div>

      <CreateCloudPhoneModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <UpdateCloudPhoneModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedPhone(null);
        }}
        data={selectedPhone}
      />
    </div>
  );
}

export default CloudPhone;
