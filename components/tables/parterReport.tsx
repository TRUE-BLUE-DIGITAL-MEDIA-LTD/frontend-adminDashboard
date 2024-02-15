import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import React, { useState } from "react";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import { GetParterPerfomacesByDate } from "../../services/everflow/partner";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { LuArrowDownUp } from "react-icons/lu";

const menuTables = [
  { title: "Network Affliate ID", sort: "up" || "down" },
  { title: "Affilate Name", sort: "up" || "down" },
  { title: "Gross Clicks", sort: "up" || "down" },
  { title: "Total Clicks", sort: "up" || "down" },
  { title: "Unique Clicks", sort: "up" || "down" },
  { title: "Duplicate Clicks", sort: "up" || "down" },
  { title: "Invalid Clicks", sort: "up" || "down" },
  { title: "CV", sort: "up" || "down" },
  { title: "CVR", sort: "up" || "down" },
  { title: "CPC", sort: "up" || "down" },
  { title: "CPA", sort: "up" || "down" },
  { title: "Payout", sort: "up" || "down" },
] as const;
function ParterReport() {
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(() => {
    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
    return [moment(yesterday).toDate(), moment(yesterday).toDate()];
  });
  const [querySort, setQuerySort] = useState<{
    title: string;
    sort: "up" | "down";
  }>({
    title: "Network Affliate ID",
    sort: "up",
  });
  const paterPerfomaces = useQuery({
    queryKey: ["partnerPerfomaces", dates],
    queryFn: () =>
      GetParterPerfomacesByDate({
        startDate: moment(dates?.[0]).toISOString(),
        endDate: moment(dates?.[1]).toISOString(),
      }),
  });
  console.log();
  return (
    <div className="w-full flex flex-col pb-20 items-center gap-5">
      <div
        className="flex p-5  mb-5  justify-center items-center
         gap-4 font-semibold text-base"
      >
        <label>Pick Up Date</label>
        <Calendar
          className="w-96"
          value={dates}
          onChange={(e) => setDates(e.value)}
          selectionMode="range"
        />
      </div>
      {paterPerfomaces.error && (
        <h2 className="font-semibold text-red-600">
          {paterPerfomaces.error?.message}
        </h2>
      )}
      <div className="overflow-x">
        <table className="table-auto overflow-scroll w-full">
          <thead className="w-full sticky top-0">
            <tr className="h-16 drop-shadow-sm bg-white">
              {menuTables.map((menu, index) => {
                return (
                  <th
                    onClick={() => {
                      setQuerySort(() => {
                        return {
                          title: menu.title,
                          sort:
                            querySort.title === menu.title &&
                            querySort.sort === "up"
                              ? "down"
                              : "up",
                        };
                      });
                    }}
                    className="text-sm p-2 cursor-pointer hover:scale-105 active:scale-110 transition duration-100 "
                    key={index}
                  >
                    <button className="flex justify-center  items-center gap-1">
                      {menu.title} <LuArrowDownUp />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="">
            {paterPerfomaces.isLoading
              ? [...new Array(10)].map((item, index) => {
                  return (
                    <tr key={index} className="gap-5 border-y-8 border-white">
                      <td className="w-32 h-8  bg-gray-400 animate-pulse rounded-lg"></td>
                      <td className="w-40 h-8  bg-gray-100 animate-pulse rounded-lg"></td>
                      <td className="w-20 h-8  bg-gray-200 animate-pulse rounded-lg"></td>
                      <td className="w-32 h-8  bg-gray-50 animate-pulse rounded-lg"></td>
                      <td className="w-32 h-8  bg-gray-200 animate-pulse rounded-lg"></td>
                      <td className="w-10 h-8  bg-gray-200 animate-pulse rounded-lg"></td>
                      <td className="w-10 h-8  bg-gray-200 animate-pulse rounded-lg"></td>
                      <td className="w-10 h-8  bg-gray-50 animate-pulse rounded-lg"></td>
                      <td className="w-10 h-8  bg-gray-200 animate-pulse rounded-lg"></td>
                      <td className="w-20 h-8  bg-gray-400 animate-pulse rounded-lg"></td>
                      <td className="w-10 h-8  bg-gray-100 animate-pulse rounded-lg"></td>
                      <td className="w-10 h-8  bg-gray-300 animate-pulse rounded-lg"></td>
                    </tr>
                  );
                })
              : paterPerfomaces.data?.table
                  .sort((a, b) => {
                    if (querySort.sort === "up") {
                      if (querySort.title === "Network Affliate ID") {
                        return a.columns[0].id.localeCompare(b.columns[0].id);
                      } else if (querySort.title === "Affilate Name") {
                        return a.columns[0].label.localeCompare(
                          b.columns[0].label
                        );
                      } else if (querySort.title === "Gross Clicks") {
                        return (
                          a.reporting.gross_click - b.reporting.gross_click
                        );
                      } else if (querySort.title === "Total Clicks") {
                        return (
                          a.reporting.total_click - b.reporting.total_click
                        );
                      } else if (querySort.title === "Unique Clicks") {
                        return (
                          a.reporting.unique_click - b.reporting.unique_click
                        );
                      } else if (querySort.title === "Duplicate Clicks") {
                        return (
                          a.reporting.duplicate_click -
                          b.reporting.duplicate_click
                        );
                      } else if (querySort.title === "Invalid Clicks") {
                        return (
                          a.reporting.invalid_click - b.reporting.invalid_click
                        );
                      } else if (querySort.title === "CV") {
                        return a.reporting.cv - b.reporting.cv;
                      } else if (querySort.title === "CVR") {
                        return a.reporting.cvr - b.reporting.cvr;
                      } else if (querySort.title === "CPC") {
                        return a.reporting.cpc - b.reporting.cpc;
                      } else if (querySort.title === "CPA") {
                        return a.reporting.cpa - b.reporting.cpa;
                      } else if (querySort.title === "Payout") {
                        return a.reporting.payout - b.reporting.payout;
                      }
                    } else if (querySort.sort === "down") {
                      if (querySort.title === "Network Affliate ID") {
                        return b.columns[0].id.localeCompare(a.columns[0].id);
                      } else if (querySort.title === "Affilate Name") {
                        return b.columns[0].label.localeCompare(
                          a.columns[0].label
                        );
                      } else if (querySort.title === "Gross Clicks") {
                        return (
                          b.reporting.gross_click - a.reporting.gross_click
                        );
                      } else if (querySort.title === "Total Clicks") {
                        return (
                          b.reporting.total_click - a.reporting.total_click
                        );
                      } else if (querySort.title === "Unique Clicks") {
                        return (
                          b.reporting.unique_click - a.reporting.unique_click
                        );
                      } else if (querySort.title === "Duplicate Clicks") {
                        return (
                          b.reporting.duplicate_click -
                          a.reporting.duplicate_click
                        );
                      } else if (querySort.title === "Invalid Clicks") {
                        return (
                          b.reporting.invalid_click - a.reporting.invalid_click
                        );
                      } else if (querySort.title === "CV") {
                        return b.reporting.cv - a.reporting.cv;
                      } else if (querySort.title === "CVR") {
                        return b.reporting.cvr - a.reporting.cvr;
                      } else if (querySort.title === "CPC") {
                        return b.reporting.cpc - a.reporting.cpc;
                      } else if (querySort.title === "CPA") {
                        return b.reporting.cpa - a.reporting.cpa;
                      } else if (querySort.title === "Payout") {
                        return b.reporting.payout - a.reporting.payout;
                      }
                    }
                    return a.columns[0].id.localeCompare(b.columns[0].id);
                  })
                  .map((item, index) => {
                    const odd = index % 2;
                    return (
                      <tr
                        key={index}
                        className={`w-full hover:bg-icon-color transition  text-sm h-10 ${
                          odd === 0 ? "bg-[#F7F6FE]" : "bg-white"
                        }`}
                      >
                        <td className="text-center">{item.columns[0].id}</td>
                        <td className="text-xs text-left max-w-40 truncate">
                          {item.columns[0].label}
                        </td>
                        <td>{item.reporting.gross_click.toLocaleString()}</td>
                        <td>{item.reporting.total_click.toLocaleString()}</td>
                        <td>{item.reporting.unique_click.toLocaleString()}</td>
                        <td>
                          {item.reporting.duplicate_click.toLocaleString()}
                        </td>
                        <td>{item.reporting.invalid_click.toLocaleString()}</td>
                        <td className="w-max px-3">
                          {item.reporting.cv.toLocaleString()}
                        </td>
                        <td className="w-max px-3">
                          {item.reporting.cvr.toLocaleString()}
                        </td>
                        <td className="w-max px-3">
                          {item.reporting.cpc.toLocaleString()}
                        </td>
                        <td className="w-max px-3">
                          {item.reporting.cpa.toLocaleString()}
                        </td>
                        <td className="w-max px-3">
                          {item.reporting.payout.toLocaleString()} $
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ParterReport;
