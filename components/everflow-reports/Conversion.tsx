import React, { useState, useEffect } from "react";
import {
  Column,
  ResponseGetConversionParterReportService,
} from "../../services/everflow/partner";
import {
  useGetConversionPartnerReport,
  useGetTimezone,
  useGetUser,
} from "../../react-query";
import { formatCurrency } from "../../utils";
import PopupLayout from "../../layouts/PopupLayout";

interface ConversionsTableProps {
  data: ResponseGetConversionParterReportService;
  onPageChange: (page: number) => void;
}

const ConversionsTable: React.FC<ConversionsTableProps> = ({
  data,
  onPageChange,
}) => {
  const { data: timezone } = useGetTimezone();

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString("en-GB", {
      timeZone: timezone || "Europe/London",
    });
  };

  // Helper to render the status with a colored pill
  const user = useGetUser();
  const renderStatus = (status: string) => {
    const isApproved = status.toLowerCase() === "approved";
    const bgColor = isApproved ? "bg-emerald-500/15" : "bg-amber-500/15";
    const textColor = isApproved ? "text-emerald-300" : "text-amber-200";

    return (
      <span
        className={`inline-flex rounded-full ${bgColor} ${textColor} px-2 text-xs font-semibold leading-5`}
      >
        {status}
      </span>
    );
  };

  const calculateAndFormatDelta = (
    conversionTimestamp: number,
    clickTimestamp: number,
  ) => {
    // 1. Get the difference in seconds
    const deltaInSeconds = conversionTimestamp - clickTimestamp;

    // Handle edge cases, like a missing click timestamp or an error
    if (isNaN(deltaInSeconds) || deltaInSeconds < 0) {
      return "N/A";
    }

    // 2. Calculate minutes and remaining seconds
    const minutes = Math.floor(deltaInSeconds / 60);
    const seconds = deltaInSeconds % 60;

    // 3. Return the formatted string
    return `${minutes} m, ${seconds} s`;
  };
  return (
    <div className="flex flex-col">
      <div className="flex h-96 w-full flex-col overflow-auto">
        <table className="w-max min-w-full divide-y divide-line">
          <thead className="bg-panel">
            <tr>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Number
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Date
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Click Date
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Delta
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Partner
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Offer
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Status
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Conversion IP
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Session IP
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Conversion ID
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Payout
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Country
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                City
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Platform
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Device
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Browser
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Carrier
              </th>
              <th
                scope="col"
                className="sticky top-0 bg-panel px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-subtle"
              >
                Sub1
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-transparent">
            {data?.map((conv, index) => (
              <tr
                key={conv.conversion_id}
                className="border-b border-line transition hover:bg-hover"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {formatTimestamp(conv.conversion_timestamp)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {formatTimestamp(conv.click_timestamp)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-fg">
                  {calculateAndFormatDelta(
                    conv.conversion_timestamp,
                    conv.click_timestamp,
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-fg">
                  {conv.network_affiliate_id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.network_offer_id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {renderStatus(conv.conversion_status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.conversion_user_ip}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.session_user_ip}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.conversion_id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.currency_converted_id
                    ? formatCurrency(
                        Number(
                          conv.fixed_rate ? conv.fixed_rate : conv.payout,
                        ) * Number(conv.exchange_rate || 1),
                        conv.currency_converted_id,
                      )
                    : formatCurrency(Number(conv.payout), conv.currency_id)}
                  {conv.currency_converted_id &&
                    user.data?.role === "admin" && (
                      <span className="text-xs">
                        {" "}
                        / Original{" "}
                        {formatCurrency(Number(conv.payout), conv.currency_id)}
                      </span>
                    )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.country}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.city}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.platform}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.device_type}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.browser}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.carrier}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-fg-muted">
                  {conv.sub1}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type Props = {
  startDate: string;
  endDate: string;
  columns: Column[];
  onClose: () => void;
};

function Conversion({ startDate, endDate, columns, onClose }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: timezone } = useGetTimezone();
  const data = useGetConversionPartnerReport({
    timezone: timezone,
    page: currentPage,
    startDate,
    endDate,
    resource_types: columns.map((c) => {
      return {
        resource_type: c.column_type,
        filter_id_value: c.id,
      };
    }),
  });

  useEffect(() => {
    data.refetch();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <PopupLayout
      onClose={onClose}
      title="Conversion report"
      subtitle={
        data.isRefetching || (data.isLoading && !data.data?.length)
          ? "Loading…"
          : undefined
      }
      maxWidthClassName="max-w-6xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-line-strong bg-transparent px-4 py-2 text-sm font-medium text-fg transition hover:bg-hover"
        >
          Close
        </button>
      }
    >
      {data.isLoading && !data.data?.length ? (
        <div className="flex h-40 items-center justify-center text-sm text-fg-muted">
          Loading…
        </div>
      ) : (
        <div className={data.isLoading ? "opacity-50" : ""}>
          {data.data && (
            <ConversionsTable
              data={data.data}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </PopupLayout>
  );
}

export default Conversion;
