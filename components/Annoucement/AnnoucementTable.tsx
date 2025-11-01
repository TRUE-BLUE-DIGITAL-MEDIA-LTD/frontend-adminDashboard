import React from "react";
import PopupLayout from "../../layouts/PopupLayout";
import AnnoucementCreate from "./AnnoucementCreate";
import { Toast } from "primereact/toast";
import { Pagination } from "@mui/material";
import {
  useDeleteAnnouncement,
  useGetByPageAnnouncement,
  useGetLatestAnnouncement,
} from "../../react-query";
import { timeLeft } from "../../utils";
import Ping from "../common/Ping";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../models";
import { MdSettings } from "react-icons/md";

function AnnoucementTable() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const toast = React.useRef<Toast>(null);
  const [page, setPage] = React.useState<number>(1);
  const [totalPage, setTotalPage] = React.useState<number>(1);
  const [triggerCreate, setTriggerCreate] = React.useState<boolean>(false);
  const currentAnnoucement = useGetLatestAnnouncement();
  const annoucements = useGetByPageAnnouncement({ page, limit: 10 });
  const deleteAnnoucement = useDeleteAnnouncement();
  React.useEffect(() => {
    if (annoucements.data) {
      setTotalPage(annoucements.data.meta.lastPage);
    }
  }, [annoucements.data]);

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteAnnoucement.mutateAsync({ id });
      await annoucements.refetch();
      setLoading(false);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Annoucement Deleted",
      });
    } catch (error) {
      setLoading(false);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };
  return (
    <>
      <Toast ref={toast} />
      {triggerCreate && (
        <PopupLayout
          onClose={() => {
            setTriggerCreate(false);
          }}
        >
          <AnnoucementCreate
            toast={toast}
            annoucements={annoucements}
            onClose={() => setTriggerCreate(false)}
          />
        </PopupLayout>
      )}
      <div className="h-max w-full max-w-7xl rounded-lg bg-white p-5 shadow-lg">
        <header className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <MdSettings />
              Manage Annoucement
            </h1>
            <span className="text-sm text-gray-400">
              You can create, update and delete annoucement here
            </span>
          </div>

          <button
            onClick={() => setTriggerCreate(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-2 text-white shadow-md
           transition duration-150 ease-in-out hover:bg-blue-600 active:scale-95"
          >
            Create Annoucement
          </button>
        </header>

        <main className="mt-5 w-full overflow-auto">
          <table className="w-full min-w-max table-auto text-center">
            <thead className="bg-gray-100">
              <tr className="text-sm font-bold text-gray-700">
                <th className="p-4">Title</th>
                <th className="p-4">Description</th>
                <th className="p-4">Begin At</th>
                <th className="p-4">Expire At</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {annoucements.data?.data.map((annoucement) => (
                <tr
                  key={annoucement.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="relative p-4">
                    <div className="max-w-40 break-words">
                      {annoucement.title}
                      {currentAnnoucement.data?.id === annoucement.id && (
                        <span className="absolute right-1 top-1 flex items-center justify-center gap-2 text-xs text-sky-500">
                          Displaying
                          <Ping />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="max-w-60 break-words">
                      {annoucement.description}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {new Date(annoucement.beginAt).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(annoucement.beginAt).toLocaleTimeString(
                          undefined,
                          {
                            hour: "numeric",
                            minute: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="max-w-40 break-words">
                      {timeLeft({
                        targetTime: new Date(
                          annoucement.expireAt,
                        ).toISOString(),
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="max-w-40 break-words">
                      {annoucement.status}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <button
                        disabled={loading}
                        onClick={() => handleDelete(annoucement.id)}
                        className="flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-white shadow-md transition duration-150 hover:bg-red-600"
                      >
                        {loading ? "Deleting" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
        <div className="mt-5 flex w-full justify-center">
          <Pagination
            page={page}
            onChange={(e, page) => {
              setPage(page);
            }}
            count={totalPage}
            color="primary"
          />
        </div>
      </div>
    </>
  );
}

export default AnnoucementTable;
