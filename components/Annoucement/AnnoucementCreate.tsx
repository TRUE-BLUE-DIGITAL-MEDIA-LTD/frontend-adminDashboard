import React from "react";
import { AnnouncementStatus, ErrorMessages } from "../../models";
import { convertToDateTimeLocalString } from "../../utils";
import { useCreateAnnouncement } from "../../react-query";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetByPageAnnouncementService } from "../../services/announcement";

const statusLists = [
  { name: "info", color: "blue" },
  { name: "success", color: "green" },
  { name: "warning", color: "yellow" },
  { name: "error", color: "red" },
] as const;
type Status = (typeof statusLists)[number]["name"];

type Props = {
  toast: React.RefObject<Toast>;
  onClose: () => void;
  annoucements: UseQueryResult<ResponseGetByPageAnnouncementService, Error>;
};
function AnnoucementCreate({ toast, onClose, annoucements }: Props) {
  const create = useCreateAnnouncement();
  const [data, setData] = React.useState<{
    title?: string;
    description?: string;
    beginAt?: string;
    expireAt?: string;
    status?: Status;
  }>({
    beginAt: convertToDateTimeLocalString(new Date()),
    status: "info",
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (
        !data.title ||
        !data.description ||
        !data.beginAt ||
        !data.expireAt ||
        !data.status
      ) {
        throw new Error("Please fill all field");
      }
      await create.mutateAsync({
        title: data?.title,
        description: data?.description,
        beginAt: new Date(data?.beginAt).toISOString(),
        expireAt: new Date(data?.expireAt).toISOString(),
        status: data?.status,
      });
      await annoucements.refetch();
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Annoucement Created",
      });
      onClose();
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-main-color focus:ring-1 focus:ring-main-color/40";

  return (
    <form onSubmit={handleCreate} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-zinc-400">Title</span>
        <input
          value={data?.title}
          onChange={(e) =>
            setData((prev) => ({ ...prev, title: e.target.value }))
          }
          type="text"
          required
          placeholder="Announcement title"
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-zinc-400">Description</span>
        <textarea
          required
          placeholder="What should users know?"
          value={data?.description}
          onChange={(e) =>
            setData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className={`resize-none ${fieldClass}`}
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-400">Begin at</span>
          <input
            required
            type="datetime-local"
            value={data?.beginAt}
            onChange={(e) =>
              setData((prev) => ({ ...prev, beginAt: e.target.value }))
            }
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-400">Expire at</span>
          <input
            required
            type="datetime-local"
            value={data?.expireAt}
            min={data?.beginAt}
            onChange={(e) =>
              setData((prev) => ({ ...prev, expireAt: e.target.value }))
            }
            className={fieldClass}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-zinc-400">Status</span>
        <select
          value={data?.status}
          onChange={(e) =>
            setData((prev) => ({ ...prev, status: e.target.value as Status }))
          }
          className={fieldClass}
        >
          {statusLists.map((status) => (
            <option key={status.name} value={status.name}>
              {status.name}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-2 flex items-center justify-end gap-3 border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
        <button
          disabled={create.isPending}
          type="submit"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-main-color hover:text-white disabled:opacity-50"
        >
          {create.isPending ? "Creating…" : "Create"}
        </button>
      </div>
    </form>
  );
}

export default AnnoucementCreate;
