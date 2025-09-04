import React, { useState } from "react";
import { MdClose, MdFlag } from "react-icons/md";
import { ErrorMessages, Priority, SimCard } from "../../models";
import { useCreateReportSimCard } from "../../react-query";
import Swal from "sweetalert2";
import { ResponseGetSimCardByPageService } from "../../services/simCard/simCard";
import { UseQueryResult } from "@tanstack/react-query";

type Props = {
  onClose: () => void;
  sim: SimCard;
  simCards: UseQueryResult<ResponseGetSimCardByPageService, Error>;
};

const issue_types = [
  "SIM NOT GET SMS",
  "SMS NOT ACTIVATE",
  "SIM GET ERROR 500",
] as const;

const priorities = ["Low", "Medium", "High", "Critical"] as const;
function ReportBox({ onClose, sim, simCards }: Props) {
  const [data, setData] = useState<{
    type: string;
    description: string;
    priority: Priority;
  }>({
    type: issue_types[0],
    description: "",
    priority: "Low",
  });
  const create = useCreateReportSimCard();
  const handleCreateReport = async () => {
    try {
      Swal.fire({
        title: "Summit The Report",
        text: "Please wait...",
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      await create.mutateAsync({
        type: data.type,
        ...(data.description !== "" && { description: data.description }),
        priority: data.priority,
        simCardId: sim.id,
      });
      await simCards.refetch();
      Swal.fire({
        title: "Success",
        text: "We have recieved your report!",
        icon: "success",
      });
      onClose();
    } catch (error) {
      console.log(error);

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
    <div className="h-max w-96 overflow-hidden rounded-lg bg-white ">
      <header className="flex w-full flex-col gap-2 border-b p-3 pb-5">
        <section className="flex w-full justify-between">
          <h1 className="text-lg font-semibold">Report SIM Issue</h1>
          <button
            onClick={() => onClose()}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-200/50 text-black hover:bg-gray-200/70"
          >
            <MdClose />
          </button>
        </section>
        <section>
          <h3 className="text-sm">
            Phone Number:{" "}
            {sim.phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, "($1) $2-$3")}
          </h3>
        </section>
      </header>
      <main className="flex flex-col gap-3 p-3">
        <section className="flex flex-col gap-1">
          <span className="text-sm">Issue Type</span>
          <select
            value={data.type}
            onChange={(e) =>
              setData((prev) => {
                return {
                  ...prev,
                  type: e.target.value,
                };
              })
            }
            className="h-10 w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {issue_types.map((c, index) => (
              <option key={index} value={c}>
                {c}
              </option>
            ))}
          </select>
        </section>
        <section className="flex flex-col gap-1">
          <span className="text-sm">Description (Optional)</span>
          <textarea
            value={data.description}
            onChange={(e) =>
              setData((prev) => {
                return {
                  ...prev,
                  description: e.target.value,
                };
              })
            }
            className="h-40 w-full resize-none rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </section>
        <section className="flex flex-col gap-1">
          <span className="text-sm">Priority</span>
          <select
            value={data.priority}
            onChange={(e) =>
              setData((prev) => {
                return {
                  ...prev,
                  priority: e.target.value as Priority,
                };
              })
            }
            className="h-10 w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {priorities.map((c, index) => (
              <option key={index} value={c}>
                {c}
              </option>
            ))}
          </select>
        </section>
      </main>
      <footer className="flex h-20 w-full items-center justify-end gap-3 border-t bg-gray-100 p-2">
        <button
          onClick={() => onClose()}
          className="flex h-10 w-32 items-center justify-center rounded-md border bg-white hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateReport}
          disabled={create.isPending}
          className="flex h-10 w-32 items-center justify-center gap-3 rounded-md border bg-red-600 text-white hover:bg-red-700"
        >
          <MdFlag /> Report
        </button>
      </footer>
    </div>
  );
}

export default ReportBox;
