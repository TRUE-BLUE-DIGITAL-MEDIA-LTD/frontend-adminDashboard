import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import React, { useEffect, useState } from "react";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import {
  Column,
  GetParterPerfomacesByDayByDayService,
  GetParterPerformanceByDate,
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
import PartnerSummaryStats from "./PartnerSummaryStats";
import BulkUpdateExchangeRate from "./BulkUpdateExchangeRate";
import AdjustLeadRatesTable from "./AdjustLeadRatesTable";

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

const sortFields: Record<MenuTitle, (item: TableEntry) => number | string> = {
  "Network Affiliate ID": (item) => Number(item.columns[0].id),
  "Affiliate Name": (item) => item.columns[0].label,
  "Gross Clicks": (item) => item.reporting.gross_click,
  "Unique Clicks": (item) => item.reporting.unique_click,
  "Duplicate Clicks": (item) => item.reporting.duplicate_click,
  "Invalid Clicks": (item) => item.reporting.invalid_click,
  "Total CV": (item) => item.reporting.total_cv,
  CV: (item) => item.reporting.cv,
  CVR: (item) => item.reporting.cvr,
  EVT: (item) => item.reporting.event,
  EVR: (item) => item.reporting.evr,
  CPC: (item) => item.reporting.cpc,
  RPC: (item) => item.reporting.rpc,
  RPA: (item) => item.reporting.rpa,
  Revenue: (item) => item.reporting.revenue,
  Payout: (item) => item.reporting.payout,
  Profit: (item) => item.reporting.profit,
  Margin: (item) => item.reporting.margin,
};

const compareTableEntries = (
  a: TableEntry,
  b: TableEntry,
  field: MenuTitle,
  direction: "up" | "down",
) => {
  const getter = sortFields[field];
  if (!getter) return 0;

  const valA = getter(a);
  const valB = getter(b);

  if (typeof valA === "string" && typeof valB === "string") {
    return direction === "up"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  }

  // Handle number comparison
  return direction === "up"
    ? (valA as number) - (valB as number)
    : (valB as number) - (valA as number);
};

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
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showAdjustRates, setShowAdjustRates] = useState(false);

  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(() => {
    const today = moment().format("YYYY-MM-DD");
    return [moment(today).toDate(), moment(today).toDate()];
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
      GetParterPerformanceByDate({
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
        type PartnerPerformanceEntry = [
          string,
          { summary: TableEntry; entries: TableEntry[] },
        ];

        const listData = Object.entries(group);
        // Recalculate CVR for each entry
        const recalculatedListData = listData.map(
          ([key, value]): PartnerPerformanceEntry => {
            const recalculatedEntries = value.entries.map((entry) => {
              const { cv, unique_click } = entry.reporting;
              // Avoid division by zero
              const newCvr = unique_click > 0 ? cv / unique_click : 0;

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
    refetchInterval: 1000 * 10,
  });

  useEffect(() => {
    if (paterPerfomaces.data) {
      setActivePartnerDropdowns(() => {
        return paterPerfomaces?.data?.map((list, key) => {
          return { key: list[0], active: false };
        });
      });
    }
  }, [paterPerfomaces.isSuccess]);

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

  console.log(activePartnerDropdowns);
  return (
    <>
      {user.role !== "admin" && <PartnerSummaryStats user={user} />}
      {targetConversionColumns && dates && dates.length === 2 && (
        <PopupLayout onClose={() => setTargetConversionColumns(null)}>
          <Conversion
            startDate={moment(dates[0]).format("YYYY-MM-DD")}
            endDate={moment(dates[1]).format("YYYY-MM-DD")}
            columns={targetConversionColumns}
          />
        </PopupLayout>
      )}
      {showBulkUpdate && (
        <PopupLayout onClose={() => setShowBulkUpdate(false)}>
          <BulkUpdateExchangeRate onClose={() => setShowBulkUpdate(false)} />
        </PopupLayout>
      )}
      {showAdjustRates && (
        <PopupLayout onClose={() => setShowAdjustRates(false)}>
          <AdjustLeadRatesTable />
        </PopupLayout>
      )}
      <div className="flex w-full flex-col items-center gap-5 py-10 pt-5">
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
              value={dates}
              onChange={(e) => {
                setDates(e.value);
              }}
              selectionMode="range"
            />
          </div>
          {user.role === "admin" && (
            <div className="flex w-full flex-col items-start justify-center gap-1 text-base font-semibold">
              <label className="flex items-center justify-center gap-1 text-base text-black">
                Action
              </label>
              <button
                onClick={() => setShowBulkUpdate(true)}
                className="h-10 w-full rounded bg-blue-600 px-4 font-bold text-white hover:bg-blue-700 xl:w-60"
              >
                Create Rate
              </button>
              <button
                onClick={() => setShowAdjustRates(true)}
                className="h-10 w-full rounded bg-green-600 px-4 font-bold text-white hover:bg-green-700 xl:w-60"
              >
                Manage Rates
              </button>
            </div>
          )}
        </div>
        {user.role === "admin" && (
          <SummaryReport user={user} summary={summary} />
        )}
        {paterPerfomaces.error && (
          <h2 className="font-semibold text-red-600">
            {paterPerfomaces.error?.message}
          </h2>
        )}
        <div className=" h-screen w-full justify-center  overflow-auto ">
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
                        <td className="h-8 w-32  animate-pulse rounded-lg bg-gray-400"></td>
                      </tr>
                    );
                  })
                : paterPerfomaces.data
                    ?.sort((a, b) =>
                      compareTableEntries(
                        a[1].summary,
                        b[1].summary,
                        querySort.title,
                        querySort.sort,
                      ),
                    )
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
                            partner[1].entries
                              .sort((a, b) =>
                                compareTableEntries(
                                  a,
                                  b,
                                  querySort.title,
                                  querySort.sort,
                                ),
                              )
                              .map((item, child_index) => {
                                const oddChild = (child_index + 1) % 2;
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
                                      key={child_index}
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
                                      key={child_index}
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
