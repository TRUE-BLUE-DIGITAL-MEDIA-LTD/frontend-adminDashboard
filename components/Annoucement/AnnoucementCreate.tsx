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
  return (
    <div className="h-max w-96 rounded-md border bg-white p-3">
      <h1 className="text-xl font-semibold">Create Annoucement</h1>
      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <input
          value={data?.title}
          onChange={(e) =>
            setData((prev) => ({ ...prev, title: e.target.value }))
          }
          type="text"
          required
          placeholder="Title"
          className="rounded-md border p-2"
        />
        <textarea
          required
          placeholder="Description"
          value={data?.description}
          onChange={(e) =>
            setData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="resize-none rounded-md border p-2"
        />
        <label className="flex flex-col">
          <span>Begin At</span>
          <input
            required
            type="datetime-local"
            value={data?.beginAt}
            onChange={(e) =>
              setData((prev) => ({ ...prev, beginAt: e.target.value }))
            }
            className="rounded-md border p-2"
          />
        </label>
        <label className="flex flex-col">
          <span>Expire At</span>
          <input
            required
            type="datetime-local"
            value={data?.expireAt}
            min={data?.beginAt}
            onChange={(e) =>
              setData((prev) => ({ ...prev, expireAt: e.target.value }))
            }
            className="rounded-md border p-2"
          />
        </label>
        <select
          value={data?.status}
          onChange={(e) =>
            setData((prev) => ({ ...prev, status: e.target.value as Status }))
          }
          className="rounded-md border p-2"
        >
          {statusLists.map((status) => (
            <option key={status.name} value={status.name}>
              {status.name}
            </option>
          ))}
        </select>
        <button disabled={create.isPending} className="main-button">
          {create.isPending ? "Loading.." : "Create"}
        </button>
      </form>
    </div>
  );
}

export default AnnoucementCreate;
