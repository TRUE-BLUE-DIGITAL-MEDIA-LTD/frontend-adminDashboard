import React, { useState, useEffect, useMemo } from "react";
import { useGetPartnerLeagueTable } from "../../react-query";
import { Skeleton } from "@mui/material";
import { countries } from "../../data/country";
import { a } from "react-spring";

const timePeriods = [
  "Last 30 Days",
  "Today",
  "Yesterday",
  "This Month",
  "Last Month",
  "Custom Range",
] as const;

type TimePeriod = (typeof timePeriods)[number];

// Helper function to format a Date object to "YYYY-MM-DD" string
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
function PartnerLeague() {
  // State for the selected time period
  const sortedCountries = useMemo(() => {
    // By using .slice(), we create a copy and avoid mutating the original array
    return countries.slice().sort((a, b) => a.country.localeCompare(b.country));
  }, []); // The empty dependency array [] means this runs only once

  const [timePeriod, setTimePeriod] = useState<TimePeriod>("Today");
  const [selectPartner, setSelectPartner] = useState<{
    affiliateInfo: {
      country: string;
      event: number;
      cv: number;
      cvr: number;
      evr: number;
      click: number;
    }[];
    partnerName: string;
    partnerId: string;
    sumEvent: number;
    sumCv: number;
    sumClick: number;
  } | null>(null);
  // State for the 'from' date
  const [fromDate, setFromDate] = useState("");
  // State for the 'to' date
  const [toDate, setToDate] = useState("");
  // State for the selected country
  const [country, setCountry] = useState("United States");

  const table = useGetPartnerLeagueTable({
    startDate: fromDate,
    endDate: toDate,
    country: country,
  });

  // useEffect to update date inputs when the timePeriod changes
  useEffect(() => {
    const today = new Date(); // Current date for consistency
    let newFromDate = new Date(today);
    let newToDate = new Date(today);

    switch (timePeriod) {
      case "Today":
        newFromDate = today;
        newToDate = today;
        break;
      case "Yesterday":
        newFromDate.setDate(today.getDate() - 1);
        newToDate.setDate(today.getDate() - 1);
        break;
      case "This Month":
        newFromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        newToDate = today;
        break;
      case "Last Month":
        newFromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newToDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "Last 30 Days":
        newFromDate.setDate(today.getDate() - 30);
        newToDate = today;
        break;
      case "Custom Range":
        // For custom range, we don't set the dates, user will pick them.
        // You might want to clear them or leave them as they are.
        setFromDate("");
        setToDate("");
        return; // Exit early
    }
    console.log("newFromDate", newFromDate);
    setFromDate(formatDate(newFromDate));
    setToDate(formatDate(newToDate));
  }, [timePeriod]); // This effect runs whenever timePeriod changes

  console.log(fromDate);
  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <header className="flex w-full flex-col items-center justify-center gap-5 p-5">
        <section className="mx-auto flex w-full max-w-7xl flex-col justify-start">
          <h1 className="w-full text-start text-3xl font-bold text-gray-900">
            Partner Events Ranking
          </h1>
          <h4 className="mt-1 text-start text-gray-500">
            Track partner performance based on number of events
          </h4>
        </section>
        <section
          className="my-5 flex w-full max-w-7xl flex-wrap items-end gap-4
          rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Time Period Dropdown */}
          <div className="flex flex-col">
            <label
              htmlFor="time-period"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Time Period
            </label>
            <select
              id="time-period"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
              className="h-10 w-60 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {timePeriods.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          {/* Country Dropdown */}
          <div className="flex flex-col">
            <label
              htmlFor="country"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-10 w-60 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {sortedCountries.map((c, index) => (
                <option key={index} value={c.country}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>
          {/* From Date Input */}
          <div className="flex flex-col">
            <label
              htmlFor="from-date"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              From
            </label>
            <input
              id="from-date"
              className="h-10 w-60 rounded-lg border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              disabled={timePeriod !== "Custom Range"}
            />
          </div>
          {/* To Date Input */}
          <div className="flex flex-col">
            <label
              htmlFor="to-date"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              To
            </label>
            <input
              id="to-date"
              className="h-10 w-60 rounded-lg border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
              disabled={timePeriod !== "Custom Range"}
            />
          </div>
        </section>
      </header>

      {table.isLoading ? (
        <Skeleton height={200} />
      ) : (
        <main className="min-h-screen  p-4 font-sans text-gray-800 md:p-8">
          <div className="mx-auto max-w-7xl">
            <header className="flex w-full flex-col items-start justify-center gap-5">
              <section className="flex w-full flex-col justify-start">
                <h1 className="w-full text-start text-3xl font-bold text-gray-800">
                  Partner Events Ranking
                </h1>
              </section>
            </header>

            <section className="mt-8">
              {/* Table Section */}
              <div className="overflow-hidden rounded-xl  shadow-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          #
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          Partner
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          <div className="flex items-center gap-1">CV</div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          <div className="flex items-center gap-1">CVR</div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          <div className="flex items-center gap-1">EVT</div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          <div className="flex items-center gap-1">EVR</div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400"
                        >
                          <div className="flex items-center gap-1">GEO</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className=" ">
                      {table.data?.map((partner, index) => (
                        <>
                          <tr
                            onClick={() =>
                              setSelectPartner((prev) => {
                                if (prev?.partnerId === partner.partnerId) {
                                  return null;
                                }
                                return partner;
                              })
                            }
                            key={partner.partnerId}
                            className="border-b transition-colors duration-200 hover:bg-gray-100"
                          >
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">
                              {index + 1}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                              <div className="flex items-center">
                                {partner.partnerName}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-700">
                              {partner.sumCv}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-700">
                              {(
                                (partner.sumCv / partner.sumClick) *
                                100
                              ).toFixed(2)}
                              %
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-700">
                              {partner.sumEvent}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-700">
                              {(
                                (partner.sumEvent / partner.sumCv) *
                                100
                              ).toFixed(2)}
                              %
                            </td>
                            <td className="flex gap-2 whitespace-nowrap px-6 py-4 text-sm text-gray-700 hover:cursor-pointer">
                              {country}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </td>
                          </tr>
                          {selectPartner?.partnerId === partner.partnerId &&
                            partner.affiliateInfo
                              .sort((a, b) => b.event - a.event)
                              .map((a, childIndex) => {
                                return (
                                  <tr
                                    key={a.country}
                                    className="bg-gray-50 transition-colors duration-200 "
                                  >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500"></td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                      <div className="flex items-center"></div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-500">
                                      {a.cv}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-500">
                                      {a.cvr.toFixed(2)}%
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-500">
                                      {a.event}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-500">
                                      {a.evr.toFixed(2)}%
                                    </td>
                                    <td className="flex gap-2 whitespace-nowrap px-6 py-4 text-sm text-gray-500 hover:cursor-pointer">
                                      {a.country}
                                    </td>
                                  </tr>
                                );
                              })}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}

export default PartnerLeague;
