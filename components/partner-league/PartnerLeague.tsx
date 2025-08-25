import React, { useState, useEffect, useMemo } from "react";
import { useGetPartnerLeagueTable } from "../../react-query";
import { Skeleton } from "@mui/material";
import { countries } from "../../data/country";
import { a } from "react-spring";
import { FaAward, FaChartBar, FaCrown, FaPeopleGroup } from "react-icons/fa6";
import { MdEvent } from "react-icons/md";
import { User } from "../../models";

const timePeriods = [
  "Last 30 Days",
  "Today",
  "Yesterday",
  "This Month",
  "Last Month",
  "Custom Range",
] as const;

type TimePeriod = (typeof timePeriods)[number];

const stats_overviews = [
  {
    title: "Total Partners",
    icon: <FaPeopleGroup />,
    color: "red",
  },
  {
    title: "Total CV",
    icon: <FaChartBar />,
    color: "blue",
  },
  {
    title: "Total EVT",
    icon: <MdEvent />,
    color: "orange",
  },
] as const;
// Helper function to format a Date object to "YYYY-MM-DD" string
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type Props = {
  user: User;
};
function PartnerLeague({ user }: Props) {
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

  function parseName(inputString: string): {
    fullName: string;
    inParentheses: string[];
  } {
    // 1. Get the full name (everything before the first parenthesis)
    // The match might be null if there are no parentheses, so we handle that case.
    const nameMatch = inputString.match(/^([^\(]+)/);
    const fullName = nameMatch ? nameMatch[1].trim() : inputString;

    // 2. Get all content inside parentheses
    // The 'g' flag ensures we find ALL matches, not just the first one.
    const parenthesesMatches = [...inputString.matchAll(/\((.*?)\)/g)];

    // The second item in each match array (index 1) is our captured group.
    const inParentheses = parenthesesMatches.map((match) => match[1]);

    return {
      fullName: fullName,
      inParentheses: inParentheses,
    };
  }

  // Pro

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
              <section className="flex w-full flex-col items-center justify-center gap-2">
                <h1 className="text-3xl font-bold">Championship Podium</h1>
                <h3 className="text-lg text-gray-500">
                  Top 3 performers of the season
                </h3>
              </section>
              <section className="mb-8 flex w-full items-end  justify-center space-x-8 drop-shadow-md">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="gradient-silver silver-glow flex h-20 w-20 items-center justify-center rounded-full border-4 border-gray-300">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                      <i className=" text-sm text-gray-600">
                        <FaAward />
                      </i>
                    </div>
                  </div>
                  <div className="silver-glow flex h-32 w-24 flex-col items-center justify-end rounded-t-lg bg-gradient-to-t from-gray-400 to-gray-300 pb-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-800">
                        {table.data?.[1].partnerName}
                      </div>
                      <div className="text-xs text-gray-700">
                        {table.data?.[1].sumEvent.toFixed(2)} EVT
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="gradient-gold podium-glow flex h-24 w-24 items-center justify-center rounded-full border-4 border-yellow-400">
                      <span className="text-3xl font-bold text-white">1</span>
                    </div>
                    <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400">
                      <i className="text-lg text-yellow-600">
                        <FaCrown />
                      </i>
                    </div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 transform">
                      <div className="flex space-x-1">
                        <i className="fas fa-star text-xs text-yellow-400"></i>
                        <i className="fas fa-star text-xs text-yellow-400"></i>
                        <i className="fas fa-star text-xs text-yellow-400"></i>
                      </div>
                    </div>
                  </div>
                  <div className="podium-glow flex h-40 w-28 flex-col items-center justify-end rounded-t-lg bg-gradient-to-t from-yellow-500 to-yellow-400 pb-4">
                    <div className="text-center">
                      <div className="font-bold text-white">
                        {table.data?.[0].partnerName}
                      </div>
                      <div className="text-sm text-yellow-100">
                        {table.data?.[0].sumEvent.toFixed(2)} EVT
                      </div>
                      <div className="mt-1 rounded-full bg-yellow-200 px-2 py-1 text-xs font-semibold text-yellow-800">
                        CHAMPION
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="gradient-bronze bronze-glow flex h-20 w-20 items-center justify-center rounded-full border-4 border-orange-400">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-400">
                      <i className="fas fa-medal text-sm text-orange-600">
                        <FaAward />
                      </i>
                    </div>
                  </div>
                  <div className="bronze-glow flex h-28 w-24 flex-col items-center justify-end rounded-t-lg bg-gradient-to-t from-orange-500 to-orange-400 pb-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-white">
                        {table.data?.[2].partnerName}
                      </div>
                      <div className="text-xs text-orange-100">
                        {table.data?.[2].sumEvent.toFixed(2)} EVT
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex w-full items-center justify-center gap-2">
                {stats_overviews.map((stats) => {
                  let number = 0;

                  switch (stats.title) {
                    case "Total CV":
                      number =
                        table.data?.reduce((prev, current) => {
                          return (prev += current.sumCv);
                        }, 0) ?? 0;
                      break;
                    case "Total EVT":
                      number =
                        table.data?.reduce((prev, current) => {
                          return (prev += current.sumEvent);
                        }, 0) ?? 0;
                      break;
                    case "Total Partners":
                      number = table.data?.length ?? 0;
                      break;

                    default:
                      break;
                  }
                  return (
                    <div
                      key={stats.title}
                      className="w-60 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stats.title}</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {number.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${stats.color}-500/20`}
                        >
                          <i className={`text-${stats.color}-500`}>
                            {stats.icon}
                          </i>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            </header>

            <section className="mt-8">
              {/* Table Section */}
              <div className="overflow-hidden rounded-xl  shadow-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="">
                      <tr className="bg-white">
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
                      {table.data?.map((partner, index) => {
                        const position = index + 1;
                        const cvr = (partner.sumCv / partner.sumClick) * 100;
                        const evr = (partner.sumEvent / partner.sumCv) * 100;
                        const name = parseName(partner.partnerName);
                        return (
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
                                {position === 1 ? (
                                  <div className="flex items-center space-x-3">
                                    <div className="gradient-gold flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                                      1
                                    </div>
                                    <i className="text-lg text-yellow-600">
                                      <FaCrown />
                                    </i>
                                  </div>
                                ) : position === 2 ? (
                                  <div className="flex items-center space-x-3">
                                    <div className="gradient-silver flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                                      2
                                    </div>
                                    <i className=" text-gray-400">
                                      <FaAward />
                                    </i>
                                  </div>
                                ) : position === 3 ? (
                                  <div className="flex items-center space-x-3">
                                    <div className="gradient-bronze flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
                                      3
                                    </div>
                                    <i className=" text-orange-500">
                                      <FaAward />
                                    </i>
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                                    {position}
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <div className="font-semibold text-gray-900">
                                      {name.fullName}
                                    </div>
                                    <div className="text-sm text-main-color">
                                      {name.inParentheses
                                        .map((n) => `(${n})`)
                                        .join("  ")}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`rounded-full px-3 py-1 text-sm font-semibold 
                                    ${partner.sumCv === 0 ? "bg-gray-100 text-gray-900" : partner.sumCv > 0 && partner.sumCv < 10 ? "bg-yellow-100 text-yellow-900" : "bg-blue-100 text-blue-900"}
                                    `}
                                >
                                  {partner.sumCv}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-700">
                                {(Number.isNaN(cvr) ? 0 : cvr).toFixed(2)}. %
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`rounded-full px-3 py-1 text-sm font-semibold 
                                    ${partner.sumCv === 0 ? "bg-gray-100 text-gray-900" : partner.sumCv > 0 && partner.sumCv < 10 ? "bg-yellow-100 text-yellow-900" : "bg-blue-100 text-blue-900"}
                                    `}
                                >
                                  {partner.sumEvent}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-700">
                                {(Number.isNaN(evr) ? 0 : cvr).toFixed(2)}. %
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
                                      <td className="px-6 py-4 text-center">
                                        <span
                                          className={`rounded-full px-3 py-1 text-sm font-semibold 
                                    ${a.cv === 0 ? "bg-gray-100 text-gray-900" : a.cv > 0 && a.cv < 10 ? "bg-yellow-100 text-yellow-900" : "bg-blue-100 text-blue-900"}
                                    `}
                                        >
                                          {a.cv}
                                        </span>
                                      </td>
                                      <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-500">
                                        {a.cvr.toFixed(2)}%
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <span
                                          className={`rounded-full px-3 py-1 text-sm font-semibold 
                                    ${a.event === 0 ? "bg-gray-100 text-gray-900" : a.event > 0 && a.event < 10 ? "bg-yellow-100 text-yellow-900" : "bg-blue-100 text-blue-900"}
                                    `}
                                        >
                                          {a.event}
                                        </span>
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
                        );
                      })}
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
