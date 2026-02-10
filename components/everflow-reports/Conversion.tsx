import React, { useState, useEffect } from "react";
import {
  Column,
  ResponseGetConversionParterReportService,
} from "../../services/everflow/partner";
import { useGetConversionPartnerReport, useGetUser } from "../../react-query";
import { formatCurrency } from "../../utils";

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

interface ConversionsTableProps {
  data: ResponseGetConversionParterReportService;
  onPageChange: (page: number) => void;
}

const ConversionsTable: React.FC<ConversionsTableProps> = ({
  data,
  onPageChange,
}) => {
  // Helper to render the status with a colored pill
  const user = useGetUser();
  const renderStatus = (status: string) => {
    const isApproved = status.toLowerCase() === "approved";
    const bgColor = isApproved ? "bg-green-100" : "bg-yellow-100";
    const textColor = isApproved ? "text-green-800" : "text-yellow-800";

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
        <table className="w-max min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Click Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Delta
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Partner
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Offer
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Conversion IP
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Session IP
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Conversion ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Payout
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Country
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                City
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Platform
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Device
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Browser
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Carrier
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Sub1
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data?.map((conv, index) => (
              <tr key={conv.conversion_id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatTimestamp(conv.conversion_timestamp)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.click_date}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {calculateAndFormatDelta(
                    conv.conversion_timestamp,
                    conv.click_timestamp,
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {conv.network_affiliate_id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.network_offer_id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {renderStatus(conv.conversion_status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.conversion_user_ip}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.session_user_ip}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.conversion_id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
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
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.country}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.city}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.platform}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.device_type}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.browser}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.carrier}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
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
};

function Conversion({ startDate, endDate, columns }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const data = useGetConversionPartnerReport({
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

  if (data.isLoading && !data.data?.length) {
    return (
      <div className="h-96 w-10/12 rounded-md bg-white p-5 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className=" w-10/12 rounded-md bg-white p-5">
      <h1 className="mb-4 text-2xl font-bold">
        Conversion Report{" "}
        {data.isRefetching && (
          <span className="text-sm font-semibold"> Loading...</span>
        )}
      </h1>

      <div className={data.isLoading ? "opacity-50" : ""}>
        {data.data && (
          <ConversionsTable data={data.data} onPageChange={handlePageChange} />
        )}{" "}
      </div>
    </div>
  );
}

export default Conversion;
