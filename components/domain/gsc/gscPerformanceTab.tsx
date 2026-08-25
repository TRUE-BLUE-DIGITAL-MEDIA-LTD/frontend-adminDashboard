import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { useGetSearchAnalytics } from "../../../react-query/domain";
import { SearchAnalyticsRow } from "../../../services/admin/domain";
import SpinLoading from "../../loadings/spinLoading";
import { buildGscDateRange } from "./dateRange";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const PRESETS = [7, 28, 90] as const;

function sum(rows: SearchAnalyticsRow[], key: "clicks" | "impressions") {
  return rows.reduce((acc, row) => acc + (row[key] ?? 0), 0);
}

function GscErrorBanner({ error }: { error: any }) {
  return (
    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
      {error?.message?.toString() ??
        "Could not load Search Console data for this domain."}
    </div>
  );
}

function RowsTable({
  title,
  rows,
  keyLabel,
}: {
  title: string;
  rows: SearchAnalyticsRow[];
  keyLabel: string;
}) {
  return (
    <div className="rounded-lg border">
      <h3 className="border-b bg-gray-50 px-4 py-2 font-medium text-gray-700">
        {title}
      </h3>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">{keyLabel}</th>
              <th className="px-2 py-2 text-right">Clicks</th>
              <th className="px-2 py-2 text-right">Impressions</th>
              <th className="px-2 py-2 text-right">CTR</th>
              <th className="px-4 py-2 text-right">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-gray-400" colSpan={5}>
                  No search data yet
                </td>
              </tr>
            )}
            {rows.slice(0, 50).map((row) => (
              <tr key={row.keys[0]} className="hover:bg-gray-50">
                <td className="max-w-xs truncate px-4 py-2">{row.keys[0]}</td>
                <td className="px-2 py-2 text-right">{row.clicks}</td>
                <td className="px-2 py-2 text-right">{row.impressions}</td>
                <td className="px-2 py-2 text-right">
                  {(row.ctr * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-2 text-right">
                  {row.position.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GscPerformanceTab({ domainId }: { domainId: string }) {
  const [days, setDays] = useState<(typeof PRESETS)[number]>(28);
  const { startDate, endDate } = buildGscDateRange(days);

  const byDate = useGetSearchAnalytics({
    domainId,
    startDate,
    endDate,
    dimension: "date",
  });
  const byQuery = useGetSearchAnalytics({
    domainId,
    startDate,
    endDate,
    dimension: "query",
  });
  const byPage = useGetSearchAnalytics({
    domainId,
    startDate,
    endDate,
    dimension: "page",
  });
  const byCountry = useGetSearchAnalytics({
    domainId,
    startDate,
    endDate,
    dimension: "country",
  });
  const byDevice = useGetSearchAnalytics({
    domainId,
    startDate,
    endDate,
    dimension: "device",
  });

  if (byDate.isError) return <GscErrorBanner error={byDate.error} />;
  if (byDate.isLoading) return <SpinLoading />;

  const dateRows = byDate.data?.rows ?? [];
  const totalClicks = sum(dateRows, "clicks");
  const totalImpressions = sum(dateRows, "impressions");
  const avgCtr =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition =
    dateRows.length > 0
      ? dateRows.reduce((acc, row) => acc + row.position, 0) / dateRows.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => setDays(preset)}
            className={`rounded-full px-4 py-1 text-sm font-medium transition ${
              days === preset
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Last {preset} days
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border bg-blue-50 p-4">
          <div className="text-xs uppercase text-blue-700">Total Clicks</div>
          <div className="text-2xl font-bold text-blue-900">{totalClicks}</div>
        </div>
        <div className="rounded-lg border bg-purple-50 p-4">
          <div className="text-xs uppercase text-purple-700">
            Total Impressions
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {totalImpressions}
          </div>
        </div>
        <div className="rounded-lg border bg-green-50 p-4">
          <div className="text-xs uppercase text-green-700">Average CTR</div>
          <div className="text-2xl font-bold text-green-900">
            {avgCtr.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-lg border bg-orange-50 p-4">
          <div className="text-xs uppercase text-orange-700">
            Average Position
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {avgPosition.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <Line
          data={{
            labels: dateRows.map((row) => row.keys[0]),
            datasets: [
              {
                label: "Clicks",
                data: dateRows.map((row) => row.clicks),
                borderColor: "#2563eb",
                backgroundColor: "#2563eb",
                yAxisID: "y",
              },
              {
                label: "Impressions",
                data: dateRows.map((row) => row.impressions),
                borderColor: "#9333ea",
                backgroundColor: "#9333ea",
                yAxisID: "y1",
              },
            ],
          }}
          options={{
            responsive: true,
            interaction: { mode: "index", intersect: false },
            scales: {
              y: { type: "linear", position: "left" },
              y1: {
                type: "linear",
                position: "right",
                grid: { drawOnChartArea: false },
              },
            },
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RowsTable
          title="Top Queries"
          keyLabel="Query"
          rows={byQuery.data?.rows ?? []}
        />
        <RowsTable
          title="Top Pages"
          keyLabel="Page"
          rows={byPage.data?.rows ?? []}
        />
        <RowsTable
          title="Countries"
          keyLabel="Country"
          rows={byCountry.data?.rows ?? []}
        />
        <RowsTable
          title="Devices"
          keyLabel="Device"
          rows={byDevice.data?.rows ?? []}
        />
      </div>
    </div>
  );
}

export default GscPerformanceTab;
