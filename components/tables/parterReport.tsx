import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import React, { useState } from "react";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import {
  GetParterPerfomacesByDate,
  GetParterPerfomacesByDayByDayService,
  GetSummaryParterReportService,
} from "../../services/everflow/partner";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { LuArrowDownUp } from "react-icons/lu";
import { User } from "../../models";
import SummaryReport from "./summaryReport";
import TbodyForEditor from "./tbodyForEditor";
import TbodyForAdmin from "./tbodyForAdmin";
import BonusCaluator from "./bonusCaluator";
import { bonusRate } from "../../data/bonusRate";
import { useCalculateBonus } from "../../utils/useCaluateBonus";

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
  const [partnerBonus, setPartnerBonus] = useState<
    {
      id: string;
      bonus: number;
    }[]
  >();

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

  const partnerPerformanceDayByDay = useQuery({
    queryKey: ["partnerPerformanceDayByDay", dates],
    queryFn: () =>
      GetParterPerfomacesByDayByDayService({
        startDate: moment(dates?.[0]).toDate(),
        endDate: moment(dates?.[1]).toDate(),
      }).then((data) => {
        const allBonus = data.map((table) => {
          return table.table.map((item) => {
            const bonus = useCalculateBonus({ payout: item.reporting.payout });
            return {
              id: item.columns[0].id,
              bonus: bonus,
            };
          });
        });
        const flatBonus = allBonus.flat();
        const groupBy = flatBonus.reduce(
          (acc, item) => {
            if (!acc[item.id]) {
              acc[item.id] = 0;
            }
            acc[item.id] += item.bonus;

            return acc;
          },
          {} as { [key: string]: number },
        );
        const result = Object.entries(groupBy).map(([id, bonus]) => ({
          id: id, // Convert id back to number if necessary
          bonus: bonus,
        }));
        const totalBonus = result.reduce((acc, item) => acc + item.bonus, 0);
        return { partner: result, totalBonus: totalBonus };
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
    <div className="flex w-full flex-col items-center gap-5 pb-20">
      <div
        className="mb-5 flex flex-col items-center  justify-center  gap-4 p-5
         text-base font-semibold md:flex-row"
      >
        <label>Pick Up Date</label>
        <Calendar
          className="w-60 xl:w-96"
          value={dates}
          onChange={(e) => {
            setDates(e.value);
          }}
          selectionMode="range"
        />
      </div>
      <BonusCaluator
        summary={summary}
        partnerPerformanceDayByDay={partnerPerformanceDayByDay}
      />

      {user.role === "admin" && <SummaryReport user={user} summary={summary} />}
      {paterPerfomaces.error && (
        <h2 className="font-semibold text-red-600">
          {paterPerfomaces.error?.message}
        </h2>
      )}
      <div className=" h-96 w-11/12 overflow-auto rounded-lg bg-slate-200  ring-1 ring-black md:w-10/12">
        <table className="w-full table-auto overflow-scroll">
          <thead className=" sticky top-0 z-40">
            <tr className="h-16 w-full  bg-white drop-shadow-sm">
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
                        "left-0 bg-white md:sticky "
                      }  ${
                        menu.title === "Affilate Name" &&
                        "sticky left-0 bg-white md:left-[6.9rem] "
                      }  cursor-pointer p-2 transition
                       duration-100 hover:scale-105 active:scale-110 `}
                      key={index}
                    >
                      <button className="flex  items-center  justify-center gap-1">
                        {menu.title} <LuArrowDownUp />
                      </button>
                    </th>
                  );
                })}
              <th
                className={`left-0 
                cursor-pointer bg-white p-2  
                text-xs transition duration-100
                  hover:scale-105 active:scale-110 md:sticky `}
              >
                <button className="flex  items-center  justify-center gap-1">
                  bonus
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="">
            {paterPerfomaces.isLoading
              ? [...new Array(10)].map((item, index) => {
                  return (
                    <tr key={index} className="gap-5 border-y-8 border-white">
                      <td className="h-8 w-32  animate-pulse rounded-lg bg-gray-400"></td>
                      <td className="h-8 w-40  animate-pulse rounded-lg bg-gray-100"></td>
                      <td className="h-8 w-20  animate-pulse rounded-lg bg-gray-200"></td>
                      <td className="h-8 w-32  animate-pulse rounded-lg bg-gray-50"></td>
                      <td className="h-8 w-32  animate-pulse rounded-lg bg-gray-200"></td>
                      <td className="h-8 w-10  animate-pulse rounded-lg bg-gray-200"></td>
                      <td className="h-8 w-10  animate-pulse rounded-lg bg-gray-200"></td>
                      <td className="h-8 w-10  animate-pulse rounded-lg bg-gray-50"></td>
                      <td className="h-8 w-10  animate-pulse rounded-lg bg-gray-200"></td>
                      <td className="h-8 w-20  animate-pulse rounded-lg bg-gray-400"></td>
                      <td className="h-8 w-10  animate-pulse rounded-lg bg-gray-100"></td>
                      <td className="h-8 w-10  animate-pulse rounded-lg bg-gray-300"></td>
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
                          b.columns[0].label,
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
                          a.columns[0].label,
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
                        <TbodyForEditor
                          partnerPerformanceDayByDay={
                            partnerPerformanceDayByDay
                          }
                          key={index}
                          odd={odd}
                          item={item}
                        />
                      );
                    } else if (user.role === "admin") {
                      return (
                        <TbodyForAdmin
                          partnerPerformanceDayByDay={
                            partnerPerformanceDayByDay
                          }
                          key={index}
                          odd={odd}
                          item={item}
                        />
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
