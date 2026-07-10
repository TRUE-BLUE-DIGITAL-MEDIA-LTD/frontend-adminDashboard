import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import Swal from "sweetalert2";
import { GetatextPrice } from "../../models";
import { useGetSmsGetatextPrices } from "../../react-query/sms-getatext";
import { getSmsGetatextNoSmsReport } from "../../services/sms-getatext";
import { toCsv } from "../../utils";

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

const ALL_SERVICES = "All services";

function SmsGetatextNoSmsReport() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [from, setFrom] = useState(formatDateInput(weekAgo));
  const [to, setTo] = useState(formatDateInput(today));
  const [service, setService] = useState<string>(ALL_SERVICES);
  const [isLoading, setIsLoading] = useState(false);
  const pricesQuery = useGetSmsGetatextPrices();

  const serviceOptions = [
    ALL_SERVICES,
    ...(pricesQuery.data?.prices || []).map(
      (p: GetatextPrice) => p.service_name,
    ),
  ];

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const fromIso = new Date(`${from}T00:00:00.000Z`).toISOString();
      const toIso = new Date(`${to}T23:59:59.999Z`).toISOString();
      const rows = await getSmsGetatextNoSmsReport({
        from: fromIso,
        to: toIso,
        serviceCode: service === ALL_SERVICES ? undefined : service,
      });

      if (rows.length === 0) {
        Swal.fire({
          title: "No numbers without SMS",
          text: "Every finished rental in this range received at least one SMS.",
          icon: "info",
        });
        return;
      }

      const csv = toCsv(
        [
          "phoneNumber",
          "serviceCode",
          "activationId",
          "createAt",
          "expireAt",
          "userEmail",
        ],
        rows.map((r) => [
          r.phoneNumber,
          r.serviceCode,
          r.activationId,
          r.createAt,
          r.expireAt,
          r.userEmail,
        ]),
      );
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const suffix =
        service === ALL_SERVICES
          ? ""
          : `-${service.replace(/[^a-z0-9]+/gi, "_")}`;
      link.download = `getatext-no-sms-report-${from}-${to}${suffix}.csv`;
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
        Service
        <Dropdown
          value={service}
          onChange={(e) => setService(e.value)}
          filter
          options={serviceOptions}
          placeholder="Select a Service"
          className="border text-sm"
        />
      </label>
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
        {isLoading ? "Preparing..." : "Download no-SMS report (CSV)"}
      </button>
    </div>
  );
}

export default SmsGetatextNoSmsReport;
