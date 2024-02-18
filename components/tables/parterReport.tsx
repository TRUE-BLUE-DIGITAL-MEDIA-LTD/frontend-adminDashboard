import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import React, { useState } from "react";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import {
  GetParterPerfomacesByDate,
  GetSummaryParterReportService,
} from "../../services/everflow/partner";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { LuArrowDownUp } from "react-icons/lu";
import { User } from "../../models";
import SummaryReport from "./summaryReport";
import TbodyForEditor from "./tbodyForEditor";
import TbodyForAdmin from "./tbodyForAdmin";

const menuTables = [
  { title: "Network Affliate ID", sort: "up" || "down" },
  { title: "Affilate Name", sort: "up" || "down" },
  { title: "Media Buying Cost", sort: "up" || "down", admin: true },
  { title: "Gross Clicks", sort: "up" || "down" },
  { title: "Total Clicks", sort: "up" || "down" },
  { title: "Unique Clicks", sort: "up" || "down" },
  { title: "Duplicate Clicks", sort: "up" || "down" },
  { title: "Invalid Clicks", sort: "up" || "down" },
  { title: "Total CV", sort: "up" || "down", admin: true },
  { title: "CV", sort: "up" || "down" },
  { title: "CVR", sort: "up" || "down" },
  { title: "CPC", sort: "up" || "down" },
  { title: "CPA", sort: "up" || "down" },
  { title: "RPC", sort: "up" || "down", admin: true },
  { title: "RPA", sort: "up" || "down", admin: true },
  { title: "Revenue", sort: "up" || "down", admin: true },
  { title: "Payout", sort: "up" || "down" },
  { title: "Profit", sort: "up" || "down", admin: true },
  { title: "Margin", sort: "up" || "down", admin: true },
];
function ParterReport({ user }: { user: User }) {
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
        startDate: moment(dates?.[0]).toDate(),
        endDate: moment(dates?.[1]).toDate(),
      }),
  });

  const summary = useQuery({
    queryKey: ["summary", dates],
    queryFn: () =>
      GetSummaryParterReportService({
        startDate: moment(dates?.[0]).toDate(),
        endDate: moment(dates?.[1]).toDate(),
      }),
  });
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
      {user.role === "editor" && (
        <div>
          <h2 className="text-xs font-semibold w-max">PAYOUT</h2>
          {summary.isLoading ? (
            <div className="w-full h-5 bg-gray-300 animate-pulse "></div>
          ) : (
            <p className="text-base text-slate-600 font-semibold w-max">
              ${summary.data?.payout.toLocaleString()}
            </p>
          )}
        </div>
      )}
      {user.role === "admin" && <SummaryReport user={user} summary={summary} />}
      {paterPerfomaces.error && (
        <h2 className="font-semibold text-red-600">
          {paterPerfomaces.error?.message}
        </h2>
      )}
      <div className=" w-10/12 ring-1 ring-black rounded-lg  h-96 overflow-auto bg-slate-200">
        <table className="overflow-scroll table-auto w-full">
          <thead className=" sticky top-0 z-40">
            <tr className="h-16 w-full  drop-shadow-sm bg-white">
              {menuTables
                .filter((list) => {
                  if (user.role === "admin") {
                    return list;
                  } else {
                    return list.admin !== true;
                  }
                })
                .map((menu, index) => {
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
                      className={`text-xs ${
                        menu.title === "Network Affliate ID" &&
                        "sticky left-0 bg-white "
                      }  ${
                        menu.title === "Affilate Name" &&
                        "sticky left-[6.9rem] bg-white "
                      }  p-2 cursor-pointer hover:scale-105
                       active:scale-110 transition duration-100 `}
                      key={index}
                    >
                      <button className="flex  justify-center  items-center gap-1">
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
                      } else if (querySort.title === "RPC") {
                        return a.reporting.rpc - b.reporting.rpc;
                      } else if (querySort.title === "RPA") {
                        return a.reporting.rpa - b.reporting.rpa;
                      } else if (querySort.title === "Revenue") {
                        return a.reporting.revenue - b.reporting.revenue;
                      } else if (querySort.title === "Profit") {
                        return a.reporting.profit - b.reporting.profit;
                      } else if (querySort.title === "Margin") {
                        return a.reporting.margin - b.reporting.margin;
                      } else if (querySort.title === "Total CV") {
                        return a.reporting.total_cv - b.reporting.total_cv;
                      } else if (querySort.title === "Media Buying Cost") {
                        return (
                          a.reporting.media_buying_cost -
                          b.reporting.media_buying_cost
                        );
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
                      } else if (querySort.title === "RPC") {
                        return b.reporting.rpc - a.reporting.rpc;
                      } else if (querySort.title === "RPA") {
                        return b.reporting.rpa - a.reporting.rpa;
                      } else if (querySort.title === "Revenue") {
                        return b.reporting.revenue - a.reporting.revenue;
                      } else if (querySort.title === "Profit") {
                        return b.reporting.profit - a.reporting.profit;
                      } else if (querySort.title === "Margin") {
                        return b.reporting.margin - a.reporting.margin;
                      } else if (querySort.title === "Total CV") {
                        return b.reporting.total_cv - a.reporting.total_cv;
                      } else if (querySort.title === "Media Buying Cost") {
                        return (
                          b.reporting.media_buying_cost -
                          a.reporting.media_buying_cost
                        );
                      }
                    }
                    return a.columns[0].id.localeCompare(b.columns[0].id);
                  })
                  .map((item, index) => {
                    const odd = index % 2;
                    if (user.role === "editor") {
                      return (
                        <TbodyForEditor key={index} odd={odd} item={item} />
                      );
                    } else if (user.role === "admin") {
                      return (
                        <TbodyForAdmin key={index} odd={odd} item={item} />
                      );
                    }
                  })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ParterReport;
