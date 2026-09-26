import React, { useMemo, useState } from "react";
import { useGetSmsReports } from "../../react-query/sms-report";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "../../hooks/useTheme";
import { chartColors } from "../../utils/theme";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type TimeRange =
  | "last 5 minutes"
  | "last 6 hours"
  | "1 day"
  | "3 days"
  | "1 week"
  | "1 month";

const ranges: TimeRange[] = [
  "last 5 minutes",
  "last 6 hours",
  "1 day",
  "3 days",
  "1 week",
  "1 month",
];

function SmsReport() {
  const { resolved } = useTheme();
  const [selectedRange, setSelectedRange] = useState<TimeRange>("last 6 hours");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Reset page when range changes
  React.useEffect(() => {
    setPage(1);
  }, [selectedRange]);

  const { startDate, endDate } = useMemo(() => {
    const end = moment();
    let start = moment();

    switch (selectedRange) {
      case "last 5 minutes":
        start = moment().subtract(5, "minutes");
        break;
      case "last 6 hours":
        start = moment().subtract(6, "hours");
        break;
      case "1 day":
        start = moment().subtract(1, "days");
        break;
      case "3 days":
        start = moment().subtract(3, "days");
        break;
      case "1 week":
        start = moment().subtract(1, "weeks");
        break;
      case "1 month":
        start = moment().subtract(1, "months");
        break;
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [selectedRange]);

  const { data: reportsData, isLoading } = useGetSmsReports({
    startDate,
    endDate,
    limit: 10000, // Fetch enough data for the graph
  });

  const { data: tableData, isLoading: tableLoading } = useGetSmsReports({
    startDate,
    endDate,
    page,
    limit,
  });

  const { chartData, bucketDetails } = useMemo(() => {
    if (!reportsData?.data) return { chartData: null, bucketDetails: [] };

    const reports = reportsData.data;

    // Better approach: Create buckets and count
    let bucketSizeMinutes = 60;
    let timeFormat = "HH:mm";

    if (selectedRange === "last 5 minutes") {
      bucketSizeMinutes = 0.5; // 30 seconds
      timeFormat = "HH:mm:ss";
    } else if (selectedRange === "last 6 hours") {
      bucketSizeMinutes = 15;
      timeFormat = "HH:mm";
    } else if (selectedRange === "1 day") {
      bucketSizeMinutes = 60;
      timeFormat = "HH:mm";
    } else if (selectedRange === "3 days") {
      bucketSizeMinutes = 60 * 6; // 6 hours
      timeFormat = "MMM DD HH:mm";
    } else if (selectedRange === "1 week") {
      bucketSizeMinutes = 60 * 24; // 1 day
      timeFormat = "MMM DD";
    } else if (selectedRange === "1 month") {
      bucketSizeMinutes = 60 * 24; // 1 day
      timeFormat = "MMM DD";
    }

    const start = moment(startDate);
    const end = moment(endDate);

    const buckets: { [key: string]: typeof reports } = {};
    const labelsMap: string[] = [];

    // Initialize buckets
    let current = start.clone();
    while (current.isBefore(end)) {
      const label = current.format(timeFormat);
      buckets[label] = [];
      labelsMap.push(label);
      current.add(bucketSizeMinutes, "minutes");
    }

    // Fill buckets
    reports.forEach((report) => {
      const reportTime = moment(report.createAt);
      const diffMinutes = reportTime.diff(start, "minutes", true);
      const bucketIndex = Math.floor(diffMinutes / bucketSizeMinutes);

      if (bucketIndex >= 0 && bucketIndex < labelsMap.length) {
        buckets[labelsMap[bucketIndex]].push(report);
      }
    });

    const details = labelsMap.map((l) => buckets[l]);

    return {
      bucketDetails: details,
      chartData: {
        labels: labelsMap,
        datasets: [
          {
            label: "Reports Created",
            data: labelsMap.map((l) => buckets[l].length),
            fill: true,
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.2)",
            tension: 0.4,
          },
        ],
      },
    };
  }, [reportsData, selectedRange, startDate, endDate]);

  const options = useMemo(() => {
    const cc = chartColors(resolved);
    return {
      responsive: true,
      color: cc.text,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          labels: { color: cc.text },
        },
        title: {
          display: true,
          text: "SMS Reports Over Time",
          color: cc.text,
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          callbacks: {
            afterBody: (context: any) => {
              const dataIndex = context[0].dataIndex;
              const reports = bucketDetails[dataIndex];
              if (!reports || reports.length === 0) return [];

              const lines: string[] = [];
              lines.push("--- Reports ---");
              reports.slice(0, 5).forEach((r) => {
                lines.push(
                  `${r.type} - ${moment(r.createAt).format("HH:mm:ss")} ${r.issue ? "(" + r.issue + ")" : ""}`,
                );
              });
              if (reports.length > 5) {
                lines.push(`...and ${reports.length - 5} more`);
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: cc.text }, grid: { color: cc.grid } },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: cc.text },
          grid: { color: cc.grid },
        },
      },
      interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
      },
    };
  }, [bucketDetails, resolved]);

  return (
    <div className="rounded-lg bg-panel p-4 shadow">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-fg">Reports Analysis</h2>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-fg-muted">
            Select Period:
          </label>
          <select
            className="rounded border border-line px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value as TimeRange)}
          >
            {ranges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-96 w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-fg-muted">Loading data...</p>
          </div>
        ) : chartData ? (
          <Line key={resolved} options={options} data={chartData} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-fg-muted">No data available</p>
          </div>
        )}
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="mb-4 text-lg font-semibold text-fg">Report Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line border">
            <thead className="bg-panel-raised">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-muted">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-muted">
                  SMS ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-muted">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-fg-muted">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-panel">
              {tableLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : tableData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    No records found
                  </td>
                </tr>
              ) : (
                tableData?.data?.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-fg">
                      {row.type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                      {row.sms_id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                      {row.issue || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                      {moment(row.createAt).format("YYYY-MM-DD HH:mm:ss")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {tableData?.meta && (
          <div className="mt-4 flex items-center justify-between border-t border-line bg-panel px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!tableData.meta.prev}
                className="relative inline-flex items-center rounded-md border border-line bg-panel px-4 py-2 text-sm font-medium text-fg-muted hover:bg-hover disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!tableData.meta.next}
                className="relative ml-3 inline-flex items-center rounded-md border border-line bg-panel px-4 py-2 text-sm font-medium text-fg-muted hover:bg-hover disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-fg-muted">
                  Showing page{" "}
                  <span className="font-medium">
                    {tableData.meta.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{tableData.meta.lastPage}</span>
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!tableData.meta.prev}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-fg-subtle ring-1 ring-inset ring-line-strong hover:bg-hover focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!tableData.meta.next}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-fg-subtle ring-1 ring-inset ring-line-strong hover:bg-hover focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SmsReport;
