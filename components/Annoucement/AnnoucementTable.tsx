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
import { FiPlus, FiTrash2 } from "react-icons/fi";


const paginationSx = {
  "& .MuiPaginationItem-root": { color: "#ffffff" },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#00ABE4",
    color: "#ffffff",
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  "& .MuiPaginationItem-icon": { color: "#ffffff" },
};

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
          title="Create announcement"
          maxWidthClassName="max-w-md"
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
      <div className="h-max w-full max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100">
        <header className="flex flex-col gap-4 border-b border-white/5 px-5 py-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
              <MdSettings className="text-[#62C7D8]" />
              Manage Announcement
            </h1>
            <span className="text-sm text-zinc-500">
              Create, review, and remove dashboard announcements.
            </span>
          </div>

          <button
            onClick={() => setTriggerCreate(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-main-color hover:bg-main-color hover:text-white active:scale-95"
          >
            <FiPlus />
            Create Announcement
          </button>
        </header>

        <main className="w-full overflow-auto">
          <table className="w-full min-w-[700px] table-fixed text-left text-sm">
            <thead className="sticky top-0 z-20 border-b border-white/5 bg-zinc-900/95 backdrop-blur">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-3">Announcement</th>
                <th className="hidden px-3 py-3 lg:table-cell">Schedule</th>
                <th className="px-3 py-3">Status</th>
                <th className="w-20 px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {annoucements.isLoading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-white/5">
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <div className="h-3 w-40 rounded bg-zinc-700" />
                          <div className="h-2.5 w-64 rounded bg-zinc-800" />
                        </div>
                      </td>
                      <td className="hidden px-3 py-4 lg:table-cell">
                        <div className="h-3 w-28 rounded bg-zinc-700" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="h-5 w-16 rounded-full bg-zinc-700" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="ml-auto h-8 w-8 rounded-lg bg-zinc-700" />
                      </td>
                    </tr>
                  ))
                : annoucements.data?.data.map((annoucement) => {
                    const statusColor =
                      annoucement.status === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : annoucement.status === "warning"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                          : annoucement.status === "error"
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                            : "border-sky-500/30 bg-sky-500/10 text-sky-300";
                    return (
                      <tr
                        key={annoucement.id}
                        className="border-b border-white/5 transition hover:bg-white/5"
                      >
                        <td className="px-5 py-3.5">
                          <div className="relative min-w-0 pr-2">
                            <p className="truncate font-medium text-white">
                              {annoucement.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                              {annoucement.description}
                            </p>
                            {currentAnnoucement.data?.id === annoucement.id && (
                              <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-sky-400">
                                Displaying
                                <Ping />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-3 py-3.5 lg:table-cell">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-zinc-300">
                              {new Date(annoucement.beginAt).toLocaleDateString(
                                undefined,
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              Expires{" "}
                              {timeLeft({
                                targetTime: new Date(
                                  annoucement.expireAt,
                                ).toISOString(),
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusColor}`}
                          >
                            {annoucement.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end">
                            <button
                              disabled={loading}
                              title="Delete"
                              onClick={() => handleDelete(annoucement.id)}
                              className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                            >
                              <FiTrash2 className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </main>
        <div className="flex justify-center border-t border-white/5 px-5 py-4">
          <div className="rounded-full border border-white/15 bg-white/5 px-3 py-2">
            <Pagination
              page={page}
              onChange={(e, page) => {
                setPage(page);
              }}
              count={totalPage}
              color="primary"
              sx={paginationSx}
            />
          </div>
        </div>
      </div>
    </>
  );
}


export default AnnoucementTable;
