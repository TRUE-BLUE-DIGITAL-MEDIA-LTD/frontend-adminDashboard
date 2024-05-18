import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import React, { useEffect, useState } from "react";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import {
  GetParterPerfomacesByDate,
  GetParterPerfomacesByDayByDayService,
  GetSummaryParterReportService,
  TableEntry,
  column_type,
} from "../../services/everflow/partner";
import { LuArrowDownUp } from "react-icons/lu";
import { User } from "../../models";
import SummaryReport from "./summaryReport";
import TbodyForEditor from "./tbodyForEditor";
import TbodyForAdmin from "./tbodyForAdmin";
import BonusCaluator from "./bonusCaluator";
import { CalculateBonus } from "../../utils/useCaluateBonus";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { CiCalendarDate } from "react-icons/ci";

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
const columns = [
  { name: "Partner", code: "affiliate" },
  { name: "Offer", code: "offer" },
  { name: "Country", code: "country" },
  { name: "Sub1", code: "sub1" },
];
function ParterReport({ user }: { user: User }) {
  const [activePartnerDropdowns, setActivePartnerDropdowns] =
    useState<{ key: string; active: boolean }[]>();
  const [selectColumns, setSelectColumns] = useState<{
    parent: {
      name: string;
      code: column_type;
    };
    child: {
      name: string;
      code: column_type;
    };
  }>({
    parent: {
      name: "Partner",
      code: "affiliate",
    },
    child: {
      name: "Offer",
      code: "offer",
    },
  });

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
    queryKey: [
      "partnerPerfomaces",
      {
        date: dates,
        columns: {
          parent: selectColumns.parent?.code,
          child: selectColumns.child?.code,
        },
      },
    ],
    queryFn: () =>
      GetParterPerfomacesByDate({
        startDate: moment(dates?.[0]).toDate(),
        endDate: moment(dates?.[1]).toDate(),
        columns: [
          { column: selectColumns.parent?.code },
          { column: selectColumns.child?.code },
        ],
      }).then((data) => {
        const group = data.table.reduce<{
          [key: string]: {
            summary: TableEntry;
            entries: TableEntry[];
          };
        }>((acc, item) => {
          // Find the affiliate column in the current item
          const firstColumn = item.columns[0].column_type;

          const affiliateColumn = item.columns.find(
            (column) => column.column_type === firstColumn,
          );

          // Check if the affiliateColumn exists and if the affiliate label is in the accumulator
          if (affiliateColumn && !acc[affiliateColumn.label]) {
            acc[affiliateColumn.label] = {
              summary: {
                columns: [],
                reporting: {
                  imp: 0,
                  total_click: 0,
                  unique_click: 0,
                  invalid_click: 0,
                  duplicate_click: 0,
                  gross_click: 0,
                  ctr: 0,
                  cv: 0,
                  invalid_cv_scrub: 0,
                  view_through_cv: 0,
                  total_cv: 0,
                  event: 0,
                  cvr: 0,
                  evr: 0,
                  cpc: 0,
                  cpm: 0,
                  cpa: 0,
                  epc: 0,
                  rpc: 0,
                  rpa: 0,
                  rpm: 0,
                  payout: 0,
                  revenue: 0,
                  event_revenue: 0,
                  gross_sales: 0,
                  profit: 0,
                  margin: 0,
                  roas: 0,
                  avg_sale_value: 0,
                  media_buying_cost: 0,
                },

                usm_columns: [],
                custom_metric_columns: [],
              },
              entries: [],
            };
          }

          // Add the current item to the appropriate affiliate label group
          if (affiliateColumn) {
            acc[affiliateColumn.label].entries.push(item);
            acc[affiliateColumn.label].summary.columns = item.columns;
            acc[affiliateColumn.label].summary.reporting.imp +=
              item.reporting.imp;
            acc[affiliateColumn.label].summary.reporting.total_click +=
              item.reporting.total_click;
            acc[affiliateColumn.label].summary.reporting.unique_click +=
              item.reporting.unique_click;
            acc[affiliateColumn.label].summary.reporting.invalid_click +=
              item.reporting.invalid_click;
            acc[affiliateColumn.label].summary.reporting.duplicate_click +=
              item.reporting.duplicate_click;
            acc[affiliateColumn.label].summary.reporting.gross_click +=
              item.reporting.gross_click;
            acc[affiliateColumn.label].summary.reporting.ctr +=
              item.reporting.ctr;
            acc[affiliateColumn.label].summary.reporting.cv +=
              item.reporting.cv;
            acc[affiliateColumn.label].summary.reporting.invalid_cv_scrub +=
              item.reporting.invalid_cv_scrub;
            acc[affiliateColumn.label].summary.reporting.view_through_cv +=
              item.reporting.view_through_cv;
            acc[affiliateColumn.label].summary.reporting.total_cv +=
              item.reporting.total_cv;
            acc[affiliateColumn.label].summary.reporting.event +=
              item.reporting.event;
            acc[affiliateColumn.label].summary.reporting.cvr =
              (acc[affiliateColumn.label].summary.reporting.cv /
                acc[affiliateColumn.label].summary.reporting.total_click) *
              100;
            acc[affiliateColumn.label].summary.reporting.evr +=
              item.reporting.evr;
            acc[affiliateColumn.label].summary.reporting.cpc +=
              item.reporting.cpc;
            acc[affiliateColumn.label].summary.reporting.cpm +=
              item.reporting.cpm;
            acc[affiliateColumn.label].summary.reporting.cpa +=
              item.reporting.cpa;
            acc[affiliateColumn.label].summary.reporting.epc +=
              item.reporting.epc;
            acc[affiliateColumn.label].summary.reporting.rpc +=
              item.reporting.rpc;
            acc[affiliateColumn.label].summary.reporting.rpa +=
              item.reporting.rpa;
            acc[affiliateColumn.label].summary.reporting.rpm +=
              item.reporting.rpm;
            acc[affiliateColumn.label].summary.reporting.payout +=
              item.reporting.payout;
            acc[affiliateColumn.label].summary.reporting.revenue +=
              item.reporting.revenue;
            acc[affiliateColumn.label].summary.reporting.event_revenue +=
              item.reporting.event_revenue;
            acc[affiliateColumn.label].summary.reporting.gross_sales +=
              item.reporting.gross_sales;
            acc[affiliateColumn.label].summary.reporting.profit +=
              item.reporting.profit;
            acc[affiliateColumn.label].summary.reporting.margin +=
              item.reporting.margin;
            acc[affiliateColumn.label].summary.reporting.roas +=
              item.reporting.roas;
            acc[affiliateColumn.label].summary.reporting.avg_sale_value +=
              item.reporting.avg_sale_value;
            acc[affiliateColumn.label].summary.reporting.media_buying_cost +=
              item.reporting.media_buying_cost;
          }

          return acc;
        }, {});
        setActivePartnerDropdowns(() => {
          return Object.keys(group).map((key) => {
            return { key: key, active: false };
          });
        });

        return Object.entries(group);
      }),
  });

  useEffect(() => {
    if (paterPerfomaces.data) {
      setActivePartnerDropdowns(() => {
        return paterPerfomaces?.data?.map((list, key) => {
          return { key: list[0], active: false };
        });
      });
    }
  }, [paterPerfomaces.data]);

  const partnerPerformanceDayByDay = useQuery({
    queryKey: ["partnerBonuse", dates],
    queryFn: () =>
      GetParterPerfomacesByDayByDayService({
        startDate: moment(dates?.[0]).toDate(),
        endDate: moment(dates?.[1]).toDate(),
        columns: [{ column: "affiliate" }],
      }).then((data) => {
        const allBonus = data.map((table) => {
          return table.table.map((item) => {
            const bonus = CalculateBonus({ payout: item.reporting.payout });
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
        columns: [{ column: "affiliate" }],
      }),
  });

  return (
    <div className="flex w-full flex-col items-center gap-5 py-10 pt-20">
      <BonusCaluator
        summary={summary}
        partnerPerformanceDayByDay={partnerPerformanceDayByDay}
      />
      <div className="flex w-10/12 flex-col items-end  justify-center gap-5 rounded-lg bg-gray-200 p-5 ring-1 ring-gray-100 md:flex-row">
        <div
          className=" md:w-70 flex w-full flex-col items-start  justify-center  gap-1 
         text-base font-semibold "
        >
          <label className="flex  items-center justify-center gap-1 text-base text-black">
            Parent
          </label>
          <Dropdown
            value={selectColumns.parent}
            onChange={(e) =>
              setSelectColumns((prev) => {
                if (prev.child.code === e.value.code) {
                  return {
                    ...prev,
                  };
                }
                return {
                  ...prev,
                  parent: e.value,
                };
              })
            }
            options={columns}
            optionLabel="name"
            placeholder="Select a Parent"
            className="w-full "
          />
        </div>
        <div
          className=" flex w-full flex-col items-start  justify-center  gap-1 
         text-base font-semibold "
        >
          <label className="flex  items-center justify-center gap-1 text-base text-black">
            Child
          </label>
          <Dropdown
            value={selectColumns.child}
            onChange={(e) =>
              setSelectColumns((prev) => {
                if (prev.parent.code === e.value.code) {
                  return {
                    ...prev,
                  };
                }
                return {
                  ...prev,
                  child: e.value,
                };
              })
            }
            options={columns}
            optionLabel="name"
            placeholder="Select a Child"
            className="w-full"
          />
        </div>
        <div
          className=" flex w-full flex-col items-start  justify-center  gap-1 
         text-base font-semibold "
        >
          <label className="flex  items-center justify-center gap-1 text-base text-black">
            Pick Up Date <CiCalendarDate />
          </label>
          <Calendar
            className="w-full xl:w-96"
            value={dates}
            onChange={(e) => {
              setDates(e.value);
            }}
            selectionMode="range"
          />
        </div>
      </div>
      {user.role === "admin" && <SummaryReport user={user} summary={summary} />}
      {paterPerfomaces.error && (
        <h2 className="font-semibold text-red-600">
          {paterPerfomaces.error?.message}
        </h2>
      )}
      <div className=" h-96 w-80 justify-center overflow-auto   md:w-[30rem] lg:w-[45rem] xl:w-[60rem] 2xl:w-[75rem] ">
        <table className="w-max min-w-full border-collapse ">
          <thead className="sticky top-0 z-40 ">
            <tr className=" h-16   bg-white drop-shadow-sm">
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
                        "sticky left-0 bg-white   "
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
          <tbody>
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
              : paterPerfomaces.data
                  ?.sort((a, b) => {
                    if (querySort.sort === "up") {
                      if (querySort.title === "Network Affliate ID") {
                        return a[1].summary.columns[0].id.localeCompare(
                          b[1].summary.columns[0].id,
                        );
                      } else if (querySort.title === "Affilate Name") {
                        return a[1].summary.columns[0].label.localeCompare(
                          b[1].summary.columns[0].label,
                        );
                      } else if (querySort.title === "Gross Clicks") {
                        return (
                          a[1].summary.reporting.gross_click -
                          b[1].summary.reporting.gross_click
                        );
                      } else if (querySort.title === "Total Clicks") {
                        return (
                          a[1].summary.reporting.total_click -
                          b[1].summary.reporting.total_click
                        );
                      } else if (querySort.title === "Unique Clicks") {
                        return (
                          a[1].summary.reporting.unique_click -
                          b[1].summary.reporting.unique_click
                        );
                      } else if (querySort.title === "Duplicate Clicks") {
                        return (
                          a[1].summary.reporting.duplicate_click -
                          b[1].summary.reporting.duplicate_click
                        );
                      } else if (querySort.title === "Invalid Clicks") {
                        return (
                          a[1].summary.reporting.invalid_click -
                          b[1].summary.reporting.invalid_click
                        );
                      } else if (querySort.title === "CV") {
                        return (
                          a[1].summary.reporting.cv - b[1].summary.reporting.cv
                        );
                      } else if (querySort.title === "CVR") {
                        return (
                          a[1].summary.reporting.cvr -
                          b[1].summary.reporting.cvr
                        );
                      } else if (querySort.title === "CPC") {
                        return (
                          a[1].summary.reporting.cpc -
                          b[1].summary.reporting.cpc
                        );
                      } else if (querySort.title === "CPA") {
                        return (
                          a[1].summary.reporting.cpa -
                          b[1].summary.reporting.cpa
                        );
                      } else if (querySort.title === "Payout") {
                        return (
                          a[1].summary.reporting.payout -
                          b[1].summary.reporting.payout
                        );
                      } else if (querySort.title === "RPC") {
                        return (
                          a[1].summary.reporting.rpc -
                          b[1].summary.reporting.rpc
                        );
                      } else if (querySort.title === "RPA") {
                        return (
                          a[1].summary.reporting.rpa -
                          b[1].summary.reporting.rpa
                        );
                      } else if (querySort.title === "Revenue") {
                        return (
                          a[1].summary.reporting.revenue -
                          b[1].summary.reporting.revenue
                        );
                      } else if (querySort.title === "Profit") {
                        return (
                          a[1].summary.reporting.profit -
                          b[1].summary.reporting.profit
                        );
                      } else if (querySort.title === "Margin") {
                        return (
                          a[1].summary.reporting.margin -
                          b[1].summary.reporting.margin
                        );
                      } else if (querySort.title === "Total CV") {
                        return (
                          a[1].summary.reporting.total_cv -
                          b[1].summary.reporting.total_cv
                        );
                      } else if (querySort.title === "Media Buying Cost") {
                        return (
                          a[1].summary.reporting.media_buying_cost -
                          b[1].summary.reporting.media_buying_cost
                        );
                      }
                    } else if (querySort.sort === "down") {
                      if (querySort.title === "Network Affliate ID") {
                        return b[1].summary.columns[0].id.localeCompare(
                          a[1].summary.columns[0].id,
                        );
                      } else if (querySort.title === "Affilate Name") {
                        return b[1].summary.columns[0].label.localeCompare(
                          a[1].summary.columns[0].label,
                        );
                      } else if (querySort.title === "Gross Clicks") {
                        return (
                          b[1].summary.reporting.gross_click -
                          a[1].summary.reporting.gross_click
                        );
                      } else if (querySort.title === "Total Clicks") {
                        return (
                          b[1].summary.reporting.total_click -
                          a[1].summary.reporting.total_click
                        );
                      } else if (querySort.title === "Unique Clicks") {
                        return (
                          b[1].summary.reporting.unique_click -
                          a[1].summary.reporting.unique_click
                        );
                      } else if (querySort.title === "Duplicate Clicks") {
                        return (
                          b[1].summary.reporting.duplicate_click -
                          a[1].summary.reporting.duplicate_click
                        );
                      } else if (querySort.title === "Invalid Clicks") {
                        return (
                          b[1].summary.reporting.invalid_click -
                          a[1].summary.reporting.invalid_click
                        );
                      } else if (querySort.title === "CV") {
                        return (
                          b[1].summary.reporting.cv - a[1].summary.reporting.cv
                        );
                      } else if (querySort.title === "CVR") {
                        return (
                          b[1].summary.reporting.cvr -
                          a[1].summary.reporting.cvr
                        );
                      } else if (querySort.title === "CPC") {
                        return (
                          b[1].summary.reporting.cpc -
                          a[1].summary.reporting.cpc
                        );
                      } else if (querySort.title === "CPA") {
                        return (
                          b[1].summary.reporting.cpa -
                          a[1].summary.reporting.cpa
                        );
                      } else if (querySort.title === "Payout") {
                        return (
                          b[1].summary.reporting.payout -
                          a[1].summary.reporting.payout
                        );
                      } else if (querySort.title === "RPC") {
                        return (
                          b[1].summary.reporting.rpc -
                          a[1].summary.reporting.rpc
                        );
                      } else if (querySort.title === "RPA") {
                        return (
                          b[1].summary.reporting.rpa -
                          a[1].summary.reporting.rpa
                        );
                      } else if (querySort.title === "Revenue") {
                        return (
                          b[1].summary.reporting.revenue -
                          a[1].summary.reporting.revenue
                        );
                      } else if (querySort.title === "Profit") {
                        return (
                          b[1].summary.reporting.profit -
                          a[1].summary.reporting.profit
                        );
                      } else if (querySort.title === "Margin") {
                        return (
                          b[1].summary.reporting.margin -
                          a[1].summary.reporting.margin
                        );
                      } else if (querySort.title === "Total CV") {
                        return (
                          b[1].summary.reporting.total_cv -
                          a[1].summary.reporting.total_cv
                        );
                      } else if (querySort.title === "Media Buying Cost") {
                        return (
                          b[1].summary.reporting.media_buying_cost -
                          a[1].summary.reporting.media_buying_cost
                        );
                      }
                    }
                    return a[1].summary.columns[0].id.localeCompare(
                      b[1].summary.columns[0].id,
                    );
                  })
                  .map((partner, index) => {
                    const odd = index % 2;

                    return (
                      <>
                        {user.role === "admin" && (
                          <TbodyForAdmin
                            activePartnerDropdowns={
                              activePartnerDropdowns ?? []
                            }
                            partner={partner}
                            setActivePartnerDropdowns={
                              setActivePartnerDropdowns
                            }
                            partnerPerformanceDayByDay={
                              partnerPerformanceDayByDay
                            }
                            key={index}
                            odd={odd}
                            item={partner[1].summary as TableEntry}
                          />
                        )}
                        {user.role === "editor" && (
                          <TbodyForEditor
                            activePartnerDropdowns={
                              activePartnerDropdowns ?? []
                            }
                            partner={partner}
                            setActivePartnerDropdowns={
                              setActivePartnerDropdowns
                            }
                            partnerPerformanceDayByDay={
                              partnerPerformanceDayByDay
                            }
                            key={index}
                            odd={odd}
                            item={partner[1].summary as TableEntry}
                          />
                        )}
                        {activePartnerDropdowns?.find(
                          (value) =>
                            value.key === partner[1].summary.columns[0].label,
                        )?.active === true &&
                          partner[1].entries.map((item, index) => {
                            const oddChild = index % 2;
                            if (user.role === "editor") {
                              return (
                                <TbodyForEditor
                                  partnerPerformanceDayByDay={
                                    partnerPerformanceDayByDay
                                  }
                                  key={index}
                                  odd={oddChild}
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
                                  odd={oddChild}
                                  item={item}
                                />
                              );
                            }
                          })}
                      </>
                    );
                  })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ParterReport;
