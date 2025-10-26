import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import React, { useEffect, useState } from "react";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import {
  Column,
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
import { GetBonusRateByUserIdService } from "../../services/bonus";
import { bonusRateDefault } from "../../data/bonusRate";
import PopupLayout from "../../layouts/PopupLayout";
import Conversion from "./Conversion";

const menuTables = [
  { title: "Network Affiliate ID", sort: "up", admin: false },
  { title: "Affiliate Name", sort: "up", admin: false },
  { title: "Gross Clicks", sort: "up", admin: false },
  { title: "Unique Clicks", sort: "up", admin: false },
  { title: "Duplicate Clicks", sort: "up", admin: false },
  { title: "Invalid Clicks", sort: "up", admin: false },
  { title: "Total CV", sort: "up", admin: true },
  { title: "CV", sort: "up", admin: false },
  { title: "CVR", sort: "up", admin: false },
  { title: "EVT", sort: "up", admin: false },
  { title: "EVR", sort: "up", admin: false },
  { title: "CPC", sort: "up", admin: false },
  { title: "RPC", sort: "up", admin: true },
  { title: "RPA", sort: "up", admin: true },
  { title: "Revenue", sort: "up", admin: true },
  { title: "Payout", sort: "up", admin: false },
  { title: "Profit", sort: "up", admin: true },
  { title: "Margin", sort: "up", admin: true },
] as const;

type MenuTitle = (typeof menuTables)[number]["title"];
const columns = [
  { name: "Partner", code: "affiliate" },
  { name: "Offer", code: "offer" },
  { name: "Country", code: "country" },
  { name: "Sub1", code: "sub1" },
  { name: "Hour", code: "hour" },
  { name: "Smart Link", code: "campaign" },
];

function ParterReport({ user }: { user: User }) {
  const [activePartnerDropdowns, setActivePartnerDropdowns] =
    useState<{ key: string; active: boolean }[]>();
  const [selectColumns, setSelectColumns] = useState<{
    parent: {
      name: string;
      code: column_type;
    };
    child:
      | {
          name: string;
          code: column_type;
        }
      | undefined;
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

  const [targetConversionColumns, setTargetConversionColumns] = useState<
    Column[] | null
  >(null);

  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(() => {
    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
    return [moment(yesterday).toDate(), moment(yesterday).toDate()];
  });
  const [querySort, setQuerySort] = useState<{
    title: MenuTitle;
    sort: "up" | "down";
  }>({
    title: "Network Affiliate ID",
    sort: "up",
  });

  const bonusRate = useQuery({
    queryKey: ["bonusRate", { userId: user.id }],
    queryFn: () => GetBonusRateByUserIdService({ userId: user.id }),
    enabled: user.role === "manager" || user.role === "admin",
  });

  const paterPerfomaces = useQuery({
    refetchInterval: 1000 * 60,
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
          selectColumns.parent?.code
            ? { column: selectColumns.parent?.code }
            : undefined,
          selectColumns?.child?.code
            ? { column: selectColumns?.child?.code }
            : undefined,
        ].filter(Boolean),
      }).then((data) => {
        const group = data;
        setActivePartnerDropdowns(() => {
          return Object.keys(group).map((key) => {
            return { key: key, active: false };
          });
        });
        type PartnerPerformanceEntry = [
          string,
          { summary: TableEntry; entries: TableEntry[] },
        ];

        const listData = Object.entries(group);
        // Recalculate CVR for each entry
        const recalculatedListData = listData.map(
          ([key, value]): PartnerPerformanceEntry => {
            const recalculatedEntries = value.entries.map((entry) => {
              const { cv, total_click } = entry.reporting;
              // Avoid division by zero
              const newCvr = total_click > 0 ? cv / total_click : 0;

              return {
                ...entry,
                reporting: {
                  ...entry.reporting,
                  cvr: newCvr * 100,
                },
              };
            });

            return [
              key,
              { summary: value.summary, entries: recalculatedEntries },
            ];
          },
        );

        return recalculatedListData;
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
        let allBonus: { id: string; bonus: number }[] = [];
        const tables = data
          .map((table) => {
            return table.table;
          })
          .flat();
        if (user.bonusCalculatePeriod === "daily") {
          allBonus = tables.map((item) => {
            const bonus = CalculateBonus({
              payout: item.reporting.payout,
              bonusRate: bonusRate.data ?? bonusRateDefault,
            });

            return {
              id: item.columns[0].id,
              bonus: bonus,
            };
          });
        }
        if (user.bonusCalculatePeriod === "monthly") {
          const totalBonusInEachId = tables.reduce(
            (acc, item) => {
              const { id } = item.columns[0];
              if (!acc[id]) {
                acc[id] = 0;
              }
              acc[id] += item.reporting.payout;
              return acc;
            },
            {} as { [key: string]: number },
          );

          allBonus = Object.entries(totalBonusInEachId).map(([id, payout]) => {
            const bonus = CalculateBonus({
              payout: payout,
              bonusRate: bonusRate.data ?? bonusRateDefault,
            });

            return {
              id: id,
              bonus: bonus,
            };
          });
        }

        const groupBy = allBonus.reduce(
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
    enabled: bonusRate.isSuccess,
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
    <>
      {targetConversionColumns && dates && dates.length === 2 && (
        <PopupLayout onClose={() => setTargetConversionColumns(null)}>
          <Conversion
            startDate={moment(dates[0]).format("YYYY-MM-DD")}
            endDate={moment(dates[1]).format("YYYY-MM-DD")}
            columns={targetConversionColumns}
          />
        </PopupLayout>
      )}
      <div className="flex w-full flex-col items-center gap-5 py-10 pt-20">
        {user.role === "manager" && (
          <BonusCaluator
            bonusRate={bonusRate.data ?? bonusRateDefault}
            summary={summary}
            partnerPerformanceDayByDay={partnerPerformanceDayByDay}
          />
        )}
        <div className="flex w-10/12 flex-col items-end  justify-center gap-5 rounded-lg bg-gray-200 p-5 ring-1 ring-gray-100 md:flex-row">
          <div
            className=" md:w-70 flex w-full flex-col items-start  justify-center  gap-1 
         text-base font-semibold "
          >
            <label className="flex  items-center justify-center gap-1 text-base text-black">
              Parent
            </label>
            <Dropdown
              showClear
              value={selectColumns.parent}
              onChange={(e) =>
                setSelectColumns((prev) => {
                  if (e.value === undefined) {
                    return {
                      parent: undefined,
                      child: prev.child,
                    };
                  }
                  if (prev.child?.code === e.value.code) {
                    return {
                      ...prev,
                    };
                  }
                  if (e.value.code === "hour") {
                    return {
                      parent: e.value,
                      child: undefined,
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
              showClear
              onChange={(e) =>
                setSelectColumns((prev) => {
                  if (e.value === undefined) {
                    return {
                      parent: prev.parent,
                      child: undefined,
                    };
                  }
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
              options={columns.filter((f) => f.code !== "hour")}
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
              className="h-10 w-full xl:w-96"
              value={dates}
              onChange={(e) => {
                setDates(e.value);
              }}
              selectionMode="range"
            />
          </div>
        </div>
        {user.role === "admin" && (
          <SummaryReport user={user} summary={summary} />
        )}
        {paterPerfomaces.error && (
          <h2 className="font-semibold text-red-600">
            {paterPerfomaces.error?.message}
          </h2>
        )}
        <div className=" h-96 w-11/12 justify-center  overflow-auto ">
          <table className="w-max min-w-full border-collapse ">
            <thead className="sticky top-0 z-30 ">
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
                          menu.title === "Network Affiliate ID" &&
                          "left-0 bg-white md:sticky "
                        }  ${
                          menu.title === "Affiliate Name" &&
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
                {user.role === "manager" && (
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
                )}
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
                        if (querySort.title === "Network Affiliate ID") {
                          return (
                            Number(a[1].summary.columns[0].id) -
                            Number(b[1].summary.columns[0].id)
                          );
                        } else if (querySort.title === "Affiliate Name") {
                          return a[1].summary.columns[0].label.localeCompare(
                            b[1].summary.columns[0].label,
                          );
                        } else if (querySort.title === "Gross Clicks") {
                          return (
                            a[1].summary.reporting.gross_click -
                            b[1].summary.reporting.gross_click
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
                            a[1].summary.reporting.cv -
                            b[1].summary.reporting.cv
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
                        } else if (querySort.title === "EVR") {
                          return (
                            a[1].summary.reporting.evr -
                            b[1].summary.reporting.evr
                          );
                        } else if (querySort.title === "EVT") {
                          return (
                            a[1].summary.reporting.event -
                            b[1].summary.reporting.event
                          );
                        }
                      } else if (querySort.sort === "down") {
                        if (querySort.title === "Network Affiliate ID") {
                          return b[1].summary.columns[0].id.localeCompare(
                            a[1].summary.columns[0].id,
                          );
                        } else if (querySort.title === "Affiliate Name") {
                          return b[1].summary.columns[0].label.localeCompare(
                            a[1].summary.columns[0].label,
                          );
                        } else if (querySort.title === "Gross Clicks") {
                          return (
                            b[1].summary.reporting.gross_click -
                            a[1].summary.reporting.gross_click
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
                            b[1].summary.reporting.cv -
                            a[1].summary.reporting.cv
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
                        } else if (querySort.title === "EVR") {
                          return (
                            b[1].summary.reporting.evr -
                            a[1].summary.reporting.evr
                          );
                        } else if (querySort.title === "EVT") {
                          return (
                            b[1].summary.reporting.event -
                            a[1].summary.reporting.event
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
                              onTriggerConversion={(column) =>
                                setTargetConversionColumns(column)
                              }
                              key={index}
                              odd={odd}
                              item={partner[1].summary as TableEntry}
                            />
                          )}
                          {(user.role === "manager" ||
                            user.role === "partner") && (
                            <TbodyForEditor
                              onTriggerConversion={(columns) => {
                                setTargetConversionColumns(columns);
                              }}
                              user={user}
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
                              value.key === partner[1].summary.columns[0].id,
                          )?.active === true &&
                            partner[1].entries.map((item, index) => {
                              const oddChild = index % 2;
                              if (
                                user.role === "manager" ||
                                user.role === "partner"
                              ) {
                                return (
                                  <TbodyForEditor
                                    user={user}
                                    onTriggerConversion={(columns) =>
                                      setTargetConversionColumns(columns)
                                    }
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
                                    onTriggerConversion={(columns) =>
                                      setTargetConversionColumns(columns)
                                    }
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
    </>
  );
}

export default ParterReport;
