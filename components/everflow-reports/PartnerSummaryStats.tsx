import React from "react";
import { User } from "../../models";
import { useGetPartnerSummaryStats, useGetTimezone } from "../../react-query";
import { MdArrowCircleDown, MdArrowCircleUp } from "react-icons/md";

type Props = {
  user: User;
};

const formatLargeNumber = (num: number, digits = 1) => {
  if (num < 1000) {
    return num.toString();
  }
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value)?.toFixed(digits).replace(rx, "$1") + si[i].symbol;
};

const formatCurrency = (num: number) => {
  if (num >= 1000) {
    return `${formatLargeNumber(num)}`;
  }
  return `${num?.toFixed(2)}`;
};

/** Formats a number as a percentage string (e.g., 0.1257 -> 12.57%) */
const formatPercentage = (num: number) => {
  return `${num?.toFixed(2)}%`;
};

interface StatCardProps {
  title: string;
  mainStatValue: string;
  percentChange: number;
  todayValue: string;
  yesterdayValue: string;
  lastMonthValue: string;
}
function PartnerSummaryStats({ user }: Props) {
  const { data: timezone } = useGetTimezone();
  const { data: stats, isLoading } = useGetPartnerSummaryStats({
    timezone,
  });

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-line bg-panel p-4 text-fg-subtle">
        Loading stats...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full rounded-2xl border border-line bg-panel p-4 text-rose-400">
        Error loading stats.
      </div>
    );
  }

  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 1 : 0;
    }
    return (current - previous) / previous;
  };
  return (
    <div className="w-full rounded-2xl border border-line bg-panel p-4 md:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Clicks"
          mainStatValue={formatLargeNumber(stats.thisMonth.unique_click)}
          percentChange={getPercentChange(
            stats.thisMonth.unique_click,
            stats.lastMonth.unique_click,
          )}
          todayValue={stats.today.unique_click?.toString() ?? ""}
          yesterdayValue={stats.yesterday.unique_click?.toString()}
          lastMonthValue={formatLargeNumber(stats.lastMonth.unique_click)}
        />

        <StatCard
          title="Payout"
          mainStatValue={formatCurrency(stats.thisMonth.payout)}
          percentChange={getPercentChange(
            stats.thisMonth.payout,
            stats.lastMonth.payout,
          )}
          todayValue={formatCurrency(stats.today?.payout) ?? ""}
          yesterdayValue={formatCurrency(stats.yesterday.payout)}
          lastMonthValue={formatCurrency(stats.lastMonth.payout)}
        />

        <StatCard
          title="Conversions"
          mainStatValue={formatLargeNumber(stats.thisMonth.cv, 0)}
          percentChange={getPercentChange(
            stats.thisMonth.cv,
            stats.lastMonth.cv,
          )}
          todayValue={stats.today.cv?.toString() ?? ""}
          yesterdayValue={stats.yesterday.cv.toString()}
          lastMonthValue={formatLargeNumber(stats.lastMonth.cv)}
        />

        <StatCard
          title="CVR"
          mainStatValue={formatPercentage(stats.thisMonth.cvr)}
          percentChange={getPercentChange(
            stats.thisMonth.cvr,
            stats.lastMonth.cvr,
          )}
          todayValue={formatPercentage(stats.today?.cvr) ?? ""}
          yesterdayValue={formatPercentage(stats.yesterday.cvr)}
          lastMonthValue={formatPercentage(stats.lastMonth.cvr)}
        />

        <StatCard
          title="Events"
          mainStatValue={stats.thisMonth.event?.toString()}
          percentChange={getPercentChange(
            stats.thisMonth.event,
            stats.lastMonth.event,
          )}
          todayValue={stats.today.event?.toString() ?? ""}
          yesterdayValue={stats.yesterday.event?.toString()}
          lastMonthValue={stats.lastMonth.event?.toString()}
        />

        <StatCard
          title="EVR"
          mainStatValue={formatPercentage(stats.thisMonth.evr)}
          percentChange={getPercentChange(
            stats.thisMonth.evr,
            stats.lastMonth.evr,
          )}
          todayValue={formatPercentage(stats.today?.evr) ?? ""}
          yesterdayValue={formatPercentage(stats.yesterday.evr)}
          lastMonthValue={formatPercentage(stats.lastMonth.evr)}
        />
      </div>
    </div>
  );
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  mainStatValue,
  percentChange,
  todayValue,
  yesterdayValue,
  lastMonthValue,
}) => {
  const isPositive = percentChange >= 0;
  const percentChangeText = `${isPositive ? "+" : ""}${(percentChange * 100)?.toFixed(0)}%`;

  return (
    <div className="w-full rounded-xl border border-line bg-surface/30 p-4">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
        {title}
      </h3>

      <div className="mb-3">
        <div className="text-xs text-fg-subtle">Current Month</div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-fg">
            {mainStatValue}
          </span>
          <span
            className={`flex items-center text-sm font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
          >
            {isPositive ? (
              <MdArrowCircleUp className="mr-1 h-4 w-4" />
            ) : (
              <MdArrowCircleDown className="mr-1 h-4 w-4" />
            )}
            {percentChangeText}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-fg-subtle">Today</span>
          <span className="font-medium text-fg">{todayValue}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-fg-subtle">Yesterday</span>
          <span className="font-medium text-fg">{yesterdayValue}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-fg-subtle">Last Month</span>
          <span className="font-medium text-fg">{lastMonthValue}</span>
        </div>
      </div>
    </div>
  );
};

export default PartnerSummaryStats;