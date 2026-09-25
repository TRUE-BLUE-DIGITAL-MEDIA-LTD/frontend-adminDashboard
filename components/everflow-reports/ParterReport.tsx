import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import {
  Column,
  GetParterPerfomacesByDayByDayService,
  GetParterPerformanceByDate,
  GetSummaryParterReportService,
  TableEntry,
  column_type,
  Reporting,
} from "../../services/everflow/partner";
import { groupBy } from "../../utils/groupBy";
import { LuArrowDownUp } from "react-icons/lu";
import { Partner, User } from "../../models";
import SummaryReport from "./summaryReport";
import TbodyForEditor from "./tbodyForEditor";
import TbodyForAdmin from "./tbodyForAdmin";
import BonusCaluator from "./bonusCaluator";
import { CalculateBonus } from "../../utils/useCaluateBonus";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { CiCalendarDate } from "react-icons/ci";
import { GetBonusRateByUserIdService } from "../../services/bonus";
import { bonusRateDefault } from "../../data/bonusRate";
import Conversion from "./Conversion";
import PartnerSummaryStats from "./PartnerSummaryStats";
import BulkUpdateExchangeRate from "./BulkUpdateExchangeRate";
import AdjustLeadRatesTable from "./AdjustLeadRatesTable";
import AiAnalysisPanel from "./AiAnalysisPanel";
import { useGetTimezone } from "@/react-query";

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
  "Network Affiliate ID": (item) => Number(item.columns[0]?.id),
  "Affiliate Name": (item) => item.columns[0]?.label,
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
  { name: "Region", code: "region" },
];

const aggregateReporting = (reports: Reporting[]): Reporting => {
  const base = { ...reports[0] };
  const keys = Object.keys(base) as (keyof Reporting)[];
  keys.forEach((key) => {
    if (typeof base[key] === "number") {
      (base as any)[key] = 0;
    }
  });

  reports.forEach((r) => {
    keys.forEach((key) => {
      if (typeof r[key] === "number") {
        (base as any)[key] += r[key];
      }
    });
  });

  if (base.imp > 0) base.ctr = (base.gross_click / base.imp) * 100;
  if (base.unique_click > 0) base.cvr = (base.cv / base.unique_click) * 100;
  if (base.unique_click > 0) base.evr = (base.event / base.unique_click) * 100;
  if (base.revenue > 0) base.margin = (base.profit / base.revenue) * 100;
  if (base.unique_click > 0) base.cpc = base.payout / base.unique_click;
  if (base.unique_click > 0) base.rpc = base.revenue / base.unique_click;
  if (base.cv > 0) base.rpa = base.revenue / base.cv;
  if (base.total_click > 0) base.epc = base.revenue / base.total_click;
  if (base.imp > 0) base.rpm = (base.revenue / base.imp) * 1000;
  if (base.media_buying_cost > 0)
    base.roas = (base.revenue / base.media_buying_cost) * 100;

  return base;
};

export type ActiceColumnKey = { key: string; child?: string; active: boolean };
function ParterReport({ user }: { user: User & { partner: Partner | null } }) {
  const [activeColumnDropdown, setActiveColumnDropdown] =
    useState<ActiceColumnKey[]>();

  const [selectColumns, setSelectColumns] = useState<{
    parent:
      | {
          name: string;
          code: column_type;
        }
      | undefined;
    child:
      | {
          name: string;
          code: column_type;
        }
      | undefined;
    grandchild:
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
    grandchild: undefined,
  });

  const [targetConversionColumns, setTargetConversionColumns] = useState<
    Column[] | null
  >(null);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showAdjustRates, setShowAdjustRates] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);

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
  const { data: timezone } = useGetTimezone();

  const bonusRate = useQuery({
    queryKey: ["bonusRate", { userId: user.id }],
    queryFn: () => GetBonusRateByUserIdService({ userId: user.id }),
    enabled: user.partner?.isAllowBonuSystem || user.role === "admin",
  });

  const paterPerfomaces = useQuery({
    queryKey: [
      "partnerPerfomaces",
      {
        date: dates,
        columns: {
          parent: selectColumns.parent?.code,
          child: selectColumns.child?.code,
          grandchild: selectColumns.grandchild?.code,
        },
        timezone: timezone,
      },
    ],
    queryFn: () =>
      GetParterPerformanceByDate({
        timezone: timezone,
        startDate: moment(dates?.[0]).toDate(),
        endDate: moment(dates?.[1]).toDate(),
        columns: [
          selectColumns.parent?.code
            ? { column: selectColumns.parent?.code }
            : undefined,
          selectColumns?.child?.code
            ? { column: selectColumns?.child?.code }
            : undefined,
          selectColumns?.grandchild?.code
            ? { column: selectColumns?.grandchild?.code }
            : undefined,
        ].filter(Boolean),
      }).then((data) => {
        const listData = Object.entries(data);
        return listData;
      }),
    enabled: !!dates && !!timezone,
    refetchInterval: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (paterPerfomaces.data) {
      setActiveColumnDropdown(() => {
        return paterPerfomaces?.data?.flatMap((list) => {
          const keys: ActiceColumnKey[] = [{ key: list[0], active: false }];
          const seenChildren = new Set<string>();

          for (const child of list[1].entries) {
            if (child.columns.length >= 3) {
              const childId = child.columns[1].id;
              if (!seenChildren.has(childId)) {
                keys.push({
                  key: list[0],
                  child: childId,
                  active: false,
                });
                seenChildren.add(childId);
              }
            }
          }

          return keys;
        });
      });
    }
  }, [paterPerfomaces.isSuccess]);

  const partnerPerformanceDayByDay = useQuery({
    queryKey: ["partnerBonuse", dates, timezone],
    queryFn: () =>
      GetParterPerfomacesByDayByDayService({
        timezone: timezone,
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
        timezone: timezone,
        startDate: moment(dates?.[0]).toDate(),
        endDate: moment(dates?.[1]).toDate(),
        columns: [{ column: "affiliate" }],
      }),
    enabled: !!dates && !!timezone,
  });

  const renderChildrenRows = (entries: TableEntry[], parentId: string) => {
    const hasGrandchildren = entries.some((e) => e.columns.length >= 3);

    if (hasGrandchildren) {
      const groups = groupBy({
        list: entries,
        keyGetter: (item: TableEntry) => item.columns[1].id,
      });

      const groupedEntries = Array.from(groups.entries()).map(
        ([childId, groupEntries]) => {
          const gEntries = groupEntries as TableEntry[];
          const summaryReporting = aggregateReporting(
            gEntries.map((e) => e.reporting),
          );
          const summaryEntry: TableEntry = {
            ...gEntries[0],
            reporting: summaryReporting,
          };
          return {
            summary: summaryEntry,
            entries: gEntries,
          };
        },
      );

      groupedEntries.sort((a, b) =>
        compareTableEntries(
          a.summary,
          b.summary,
          querySort.title,
          querySort.sort,
        ),
      );

      return groupedEntries.map((group, groupIndex) => {
        const odd = (groupIndex + 1) % 2;
        const childId = group.summary.columns[1].id;
        const isExpanded = activeColumnDropdown?.find(
          (k) => k.key === parentId && k.child === childId,
        )?.active;

        if (user.role === "admin") {
          return (
            <React.Fragment key={childId}>
              <TbodyForAdmin
                activeColumnDropdown={activeColumnDropdown ?? []}
                setActiveColumnDropdown={setActiveColumnDropdown}
                partnerPerformanceDayByDay={partnerPerformanceDayByDay}
                onTriggerConversion={(cols) => setTargetConversionColumns(cols)}
                key={childId}
                odd={odd}
                item={group.summary}
                isGroupedChild={true}
                parentId={parentId}
              />
              {isExpanded &&
                group.entries
                  .sort((a, b) =>
                    compareTableEntries(a, b, querySort.title, querySort.sort),
                  )
                  .map((entry, entryIndex) => (
                    <TbodyForAdmin
                      key={`${childId}-${entryIndex}`}
                      activeColumnDropdown={activeColumnDropdown ?? []}
                      setActiveColumnDropdown={setActiveColumnDropdown}
                      partnerPerformanceDayByDay={partnerPerformanceDayByDay}
                      onTriggerConversion={(cols) =>
                        setTargetConversionColumns(cols)
                      }
                      odd={odd}
                      item={entry}
                      isGrandchild={true}
                    />
                  ))}
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={childId}>
              <TbodyForEditor
                user={user}
                activeColumnDropdown={activeColumnDropdown ?? []}
                setActiveColumnDropdown={setActiveColumnDropdown}
                partnerPerformanceDayByDay={partnerPerformanceDayByDay}
                onTriggerConversion={(cols) => setTargetConversionColumns(cols)}
                key={childId}
                odd={odd}
                item={group.summary}
                isGroupedChild={true}
                parentId={parentId}
              />
              {isExpanded &&
                group.entries
                  .sort((a, b) =>
                    compareTableEntries(a, b, querySort.title, querySort.sort),
                  )
                  .map((entry, entryIndex) => (
                    <TbodyForEditor
                      user={user}
                      key={`${childId}-${entryIndex}`}
                      activeColumnDropdown={activeColumnDropdown ?? []}
                      setActiveColumnDropdown={setActiveColumnDropdown}
                      partnerPerformanceDayByDay={partnerPerformanceDayByDay}
                      onTriggerConversion={(cols) =>
                        setTargetConversionColumns(cols)
                      }
                      odd={odd}
                      item={entry}
                      isGrandchild={true}
                    />
                  ))}
            </React.Fragment>
          );
        }
      });
    } else {
      return entries
        .sort((a, b) =>
          compareTableEntries(a, b, querySort.title, querySort.sort),
        )
        .map((item, child_index) => {
          const oddChild = (child_index + 1) % 2;
          if (user.role === "manager" || user.role === "partner") {
            return (
              <TbodyForEditor
                user={user}
                onTriggerConversion={(columns) =>
                  setTargetConversionColumns(columns)
                }
                partnerPerformanceDayByDay={partnerPerformanceDayByDay}
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
                partnerPerformanceDayByDay={partnerPerformanceDayByDay}
                key={child_index}
                odd={oddChild}
                item={item}
              />
            );
          }
        });
    }
  };

  return (
    <>
      {targetConversionColumns && dates && dates.length === 2 && (
        <Conversion
          startDate={moment(dates[0]).format("YYYY-MM-DD")}
          endDate={moment(dates[1]).format("YYYY-MM-DD")}
          columns={targetConversionColumns}
          onClose={() => setTargetConversionColumns(null)}
        />
      )}
      {showBulkUpdate && (
        <BulkUpdateExchangeRate onClose={() => setShowBulkUpdate(false)} />
      )}
      {showAdjustRates && (
        <AdjustLeadRatesTable
          user={user}
          onClose={() => setShowAdjustRates(false)}
        />
      )}

      <div className="mx-auto flex w-full  flex-col gap-5 bg-surface px-4 py-6 md:px-6">
        {/* Page header */}
        <header className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-main-color">
            Reports
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">
            Partners performance
          </h1>
          <p className="text-sm text-fg-subtle">
            {dates?.[0] && dates?.[1]
              ? `${moment(dates[0]).format("MMM D, YYYY")} – ${moment(dates[1]).format("MMM D, YYYY")}`
              : "Select a date range"}
            {timezone ? ` · ${timezone}` : ""}
          </p>
        </header>

        {/* Toolbar */}
        <div className="rounded-2xl border border-line bg-panel p-4 md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid w-full flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-fg-muted">
                  Parent
                </label>
                <Dropdown
                  showClear
                  value={selectColumns.parent}
                  onChange={(e) =>
                    setSelectColumns((prev) => {
                      if (!e.value) {
                        return { ...prev, parent: undefined };
                      }
                      if (e.value.code === "hour") {
                        return {
                          parent: e.value,
                          child: undefined,
                          grandchild: undefined,
                        };
                      }
                      return {
                        ...prev,
                        parent: e.value,
                      };
                    })
                  }
                  options={columns.filter(
                    (c) =>
                      c.code !== selectColumns.child?.code &&
                      c.code !== selectColumns.grandchild?.code,
                  )}
                  optionLabel="name"
                  placeholder="Select a Parent"
                  className="w-full rounded-lg border border-line bg-surface/40 text-fg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-fg-muted">
                  Child
                </label>
                <Dropdown
                  value={selectColumns.child}
                  showClear
                  onChange={(e) =>
                    setSelectColumns((prev) => {
                      if (!e.value) {
                        return { ...prev, child: undefined };
                      }
                      return {
                        ...prev,
                        child: e.value,
                      };
                    })
                  }
                  options={columns.filter(
                    (f) =>
                      f.code !== "hour" &&
                      f.code !== selectColumns.parent?.code &&
                      f.code !== selectColumns.grandchild?.code,
                  )}
                  optionLabel="name"
                  placeholder="Select a Child"
                  className="w-full rounded-lg border border-line bg-surface/40 text-fg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-fg-muted">
                  Grandchild
                </label>
                <Dropdown
                  value={selectColumns.grandchild}
                  showClear
                  onChange={(e) =>
                    setSelectColumns((prev) => {
                      if (!e.value) {
                        return { ...prev, grandchild: undefined };
                      }
                      return {
                        ...prev,
                        grandchild: e.value,
                      };
                    })
                  }
                  options={columns.filter(
                    (f) =>
                      f.code !== "hour" &&
                      f.code !== selectColumns.parent?.code &&
                      f.code !== selectColumns.child?.code,
                  )}
                  optionLabel="name"
                  placeholder="Select a Grandchild"
                  className="w-full rounded-lg border border-line bg-surface/40 text-fg"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1 text-xs font-medium text-fg-muted">
                  Date range <CiCalendarDate />
                </label>
                <Calendar
        panelClassName="oxy-overlay-panel"
                  value={dates}
                  onChange={(e) => {
                    setDates(e.value);
                  }}
                  selectionMode="range"
                  className="w-full rounded-lg border border-line bg-surface/40 text-fg "
                />
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              {user.role === "admin" && (
                <button
                  onClick={() => setShowBulkUpdate(true)}
                  className="h-10 rounded-full bg-fg px-4 text-sm font-semibold text-surface transition hover:bg-fg/80"
                >
                  Create Rate
                </button>
              )}
              <button
                onClick={() => setShowAdjustRates(true)}
                className="h-10 rounded-full border border-line-strong px-4 text-sm font-medium text-fg transition hover:bg-hover"
              >
                View Rates
              </button>
              <button
                onClick={() => setShowAiAnalysis(true)}
                className="h-10 rounded-full border border-line-strong px-4 text-sm font-medium text-fg transition hover:bg-hover"
              >
                Analyze with AI
              </button>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        {user.role !== "admin" && <PartnerSummaryStats user={user} />}
        {user.role === "admin" && (
          <SummaryReport user={user} summary={summary} />
        )}

        {/* Bonus */}
        {user.partner?.isAllowBonuSystem && (
          <BonusCaluator
            bonusRate={bonusRate.data ?? bonusRateDefault}
            summary={summary}
            partnerPerformanceDayByDay={partnerPerformanceDayByDay}
          />
        )}

        {/* AI panel */}
        {showAiAnalysis && dates && dates.length === 2 && (
          <AiAnalysisPanel
            dates={dates}
            timezone={timezone}
            user={user}
            onClose={() => setShowAiAnalysis(false)}
          />
        )}

        {paterPerfomaces.error && (
          <h2 className="font-semibold text-rose-400">
            {paterPerfomaces.error?.message}
          </h2>
        )}

        {/* Data table card */}
        <div className="overflow-hidden rounded-2xl border border-line bg-panel">
          <div className="max-h-[70vh] w-full overflow-auto">
            <table className="w-max min-w-full border-collapse">
              <thead className="sticky top-0 z-30">
                <tr className="h-12 bg-panel">
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
                          className={`cursor-pointer px-2 py-3 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle transition hover:text-fg ${
                            menu.title === "Network Affiliate ID" &&
                            "left-0 bg-panel md:sticky"
                          } ${
                            menu.title === "Affiliate Name" &&
                            "sticky left-0 bg-panel"
                          }`}
                          key={index}
                        >
                          <button className="flex items-center justify-center gap-1">
                            {menu.title}{" "}
                            <LuArrowDownUp className="text-main-color" />
                          </button>
                        </th>
                      );
                    })}
                  {user.partner?.isAllowBonuSystem && (
                    <th className="cursor-pointer bg-panel px-2 py-3 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle md:sticky md:left-0">
                      <button className="flex items-center justify-center gap-1">
                        bonus
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              {paterPerfomaces.isLoading && (
                <tbody>
                  {[...new Array(10)].map((item, index) => {
                    return (
                      <tr key={index} className="border-b border-line">
                        <td className="h-8 w-32 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-40 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-20 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-32 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-32 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-10 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-10 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-10 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-10 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-20 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-10 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-10 animate-pulse rounded bg-panel-raised"></td>
                        <td className="h-8 w-32 animate-pulse rounded bg-panel-raised"></td>
                      </tr>
                    );
                  })}
                </tbody>
              )}

              {paterPerfomaces.data
                ?.sort((a, b) =>
                  compareTableEntries(
                    a[1].summary,
                    b[1].summary,
                    querySort.title,
                    querySort.sort,
                  ),
                )
                .map((column, index) => {
                  const odd = index % 2;

                  return (
                    <tbody key={index}>
                      {user.role === "admin" && (
                        <TbodyForAdmin
                          activeColumnDropdown={activeColumnDropdown ?? []}
                          partner={column}
                          setActiveColumnDropdown={setActiveColumnDropdown}
                          partnerPerformanceDayByDay={
                            partnerPerformanceDayByDay
                          }
                          onTriggerConversion={(column) =>
                            setTargetConversionColumns(column)
                          }
                          key={index}
                          odd={odd}
                          item={column[1].summary as TableEntry}
                        />
                      )}
                      {(user.role === "manager" || user.role === "partner") && (
                        <TbodyForEditor
                          onTriggerConversion={(columns) => {
                            setTargetConversionColumns(columns);
                          }}
                          user={user}
                          activeColumnDropdown={activeColumnDropdown ?? []}
                          partner={column}
                          setActiveColumnDropdown={setActiveColumnDropdown}
                          partnerPerformanceDayByDay={
                            partnerPerformanceDayByDay
                          }
                          key={index}
                          odd={odd}
                          item={column[1].summary as TableEntry}
                        />
                      )}

                      {activeColumnDropdown?.find(
                        (value) =>
                          value.key === column[1].summary.columns[0]?.id,
                      )?.active === true &&
                        renderChildrenRows(
                          column[1].entries,
                          column[1].summary.columns[0]?.id,
                        )}
                    </tbody>
                  );
                })}
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ParterReport;
