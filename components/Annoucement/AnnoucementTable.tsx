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
      <div className="h-max w-11/12 rounded-md border p-5">
        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">Manage Annoucement</h1>
            <span className="text-sm text-gray-400">
              You can create, update and delete annoucement here
            </span>
          </div>

          <button
            onClick={() => setTriggerCreate(true)}
            className="main-button rounded-md text-black "
          >
            Create Annoucement
          </button>
        </header>

        <main className="mt-2  h-max max-h-80 w-full overflow-auto">
          <table className="w-max min-w-full border-collapse border">
            <thead>
              <tr className="border">
                <th className="border text-left">
                  <div className="w-40 p-2">Title</div>
                </th>
                <th className="border text-left">
                  <div className="w-40 p-2">Description</div>
                </th>
                <th className="border text-left">
                  <div className="w-40 p-2">Begin At</div>
                </th>
                <th className="border text-left">
                  <div className="w-40 p-2">Expire At</div>
                </th>
                <th className="border text-left">
                  <div className="w-40 p-2">Status</div>
                </th>
                <th className="border text-left">
                  <div className="w-40 p-2">Action</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {annoucements.data?.data.map((annoucement) => (
                <tr key={annoucement.id}>
                  <td className="relative border">
                    <div className=" max-w-40 break-words p-2">
                      {annoucement.title}
                      {currentAnnoucement.data?.id === annoucement.id && (
                        <span className="absolute right-1 top-1 flex items-center justify-center gap-2 text-xs text-sky-500">
                          Displaying
                          <Ping />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border">
                    <div className="max-w-60 break-words p-2">
                      {annoucement.description}
                    </div>
                  </td>
                  <td className="border">
                    <div className="flex flex-col p-2">
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
                  <td className="border">
                    <div className="max-w-40 break-words p-2">
                      {timeLeft({
                        targetTime: new Date(
                          annoucement.expireAt,
                        ).toISOString(),
                      })}
                    </div>
                  </td>
                  <td className="border">
                    <div className="max-w-40 break-words p-2">
                      {annoucement.status}
                    </div>
                  </td>
                  <td className="border">
                    <div className="p-2">
                      <button
                        disabled={loading}
                        onClick={() => handleDelete(annoucement.id)}
                        className="text-red-500"
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
        <div className="flex w-full justify-center">
          <Pagination
            className="mt-5"
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
