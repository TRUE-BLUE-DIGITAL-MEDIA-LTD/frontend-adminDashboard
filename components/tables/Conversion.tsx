import React, { useState, useEffect } from "react";
import {
  Column,
  ResponseGetConversionParterReportService,
} from "../../services/everflow/partner";
import { useGetConversionPartnerReport } from "../../react-query";

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD", // Fallback to USD
  }).format(amount);
};

interface PaginationControlsProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  // *** TOTAL PAGE CALCULATION ***
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            of <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              &lt;
            </button>
            <span
              aria-current="page"
              className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {currentPage}
            </span>
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
              ...
            </span>
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
              {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              &gt;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

interface ConversionsTableProps {
  data: ResponseGetConversionParterReportService;
  onPageChange: (page: number) => void;
}

const ConversionsTable: React.FC<ConversionsTableProps> = ({
  data,
  onPageChange,
}) => {
  const { conversions, paging } = data;

  // Helper to render the status with a colored pill
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
            {conversions.map((conv) => (
              <tr key={conv.conversion_id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatTimestamp(conv.conversion_unix_timestamp)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatTimestamp(conv.click_unix_timestamp)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {calculateAndFormatDelta(
                    conv.conversion_unix_timestamp,
                    conv.click_unix_timestamp,
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {conv.relationship.affiliate.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {conv.relationship.offer.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {renderStatus(conv.status)}
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
                  {formatCurrency(conv.payout, conv.currency_id)}
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
      <PaginationControls
        currentPage={paging.page}
        totalCount={paging.total_count}
        pageSize={paging.page_size}
        onPageChange={onPageChange}
      />
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (data.isLoading && !data.data?.conversions.length) {
    return (
      <div className="h-96 w-10/12 rounded-md bg-white p-5 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className=" w-10/12 rounded-md bg-white p-5">
      <h1 className="mb-4 text-2xl font-bold">Conversion Report</h1>
      <div className={data.isLoading ? "opacity-50" : ""}>
        {data.data && (
          <ConversionsTable data={data.data} onPageChange={handlePageChange} />
        )}{" "}
      </div>
    </div>
  );
}

export default Conversion;
