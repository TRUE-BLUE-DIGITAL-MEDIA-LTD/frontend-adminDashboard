import { useState } from "react";
import Swal from "sweetalert2";
import { getSmsGetatextDelayedReport } from "../../services/sms-getatext";
import { toCsv } from "../../utils";

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

function SmsGetatextDelayReport() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [from, setFrom] = useState(formatDateInput(weekAgo));
  const [to, setTo] = useState(formatDateInput(today));
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const fromIso = new Date(`${from}T00:00:00.000Z`).toISOString();
      const toIso = new Date(`${to}T23:59:59.999Z`).toISOString();
      const rows = await getSmsGetatextDelayedReport({
        from: fromIso,
        to: toIso,
      });

      if (rows.length === 0) {
        Swal.fire({
          title: "No delayed SMS",
          text: "No messages took more than 10 seconds in this date range.",
          icon: "info",
        });
        return;
      }

      const csv = toCsv(
        [
          "id",
          "phoneNumber",
          "serviceCode",
          "code",
          "receviedAt",
          "createAt",
          "delaySeconds",
        ],
        rows.map((r) => [
          r.activationId || "N/A",
          r.phoneNumber,
          r.serviceCode,
          r.code,
          r.receviedAt,
          r.createAt,
          r.delaySeconds,
        ]),
      );
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `getatext-delay-report-${from}-${to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      Swal.fire({
        title: "Download failed",
        text:
          error?.response?.data?.message?.toString() || "Something went wrong!",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-end justify-center gap-2">
      <label className="flex flex-col text-xs text-gray-600">
        From
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col text-xs text-gray-600">
        To
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        />
      </label>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {isLoading ? "Preparing..." : "Download delay report (CSV)"}
      </button>
    </div>
  );
}

export default SmsGetatextDelayReport;
