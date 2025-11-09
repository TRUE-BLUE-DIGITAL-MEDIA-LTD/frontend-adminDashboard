import React from "react";
import { User } from "../../models";
import { useGetPartnerSummaryStats } from "../../react-query";
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
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
};

const formatCurrency = (num: number) => {
  if (num >= 1000) {
    return `$${formatLargeNumber(num)}`;
  }
  return `$${num.toFixed(2)}`;
};

/** Formats a number as a percentage string (e.g., 0.1257 -> 12.57%) */
const formatPercentage = (num: number) => {
  return `${num.toFixed(2)}%`;
};

interface StatCardProps {
  title: string;
  mainStatValue: string;
  percentChange: number; // e.g., 0.75 for +75%, -0.1 for -10%
  todayValue: string;
  yesterdayValue: string;
  lastMonthValue: string;
}
function PartnerSummaryStats({ user }: Props) {
  const { data: stats, isLoading } = useGetPartnerSummaryStats();

  if (isLoading) {
    return <div className="p-4 text-slate-500">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="p-4 text-red-500">Error loading stats.</div>;
  }

  // Helper to calculate percentage change, avoiding division by zero
  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? 1 : 0; // Show +100% if previous was 0 and current is positive
    }
    return (current - previous) / previous;
  };
  return (
    <div className="bg-white p-4">
      {/* This is the responsive grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Clicks"
          mainStatValue={formatLargeNumber(stats.thisMonth.gross_click)}
          percentChange={getPercentChange(
            stats.thisMonth.gross_click,
            stats.lastMonth.gross_click,
          )}
          todayValue={stats.today.gross_click.toString()}
          yesterdayValue={stats.yesterday.gross_click.toString()}
          lastMonthValue={formatLargeNumber(stats.lastMonth.gross_click)}
        />

        <StatCard
          title="Revenue"
          mainStatValue={formatCurrency(stats.thisMonth.revenue)}
          percentChange={getPercentChange(
            stats.thisMonth.revenue,
            stats.lastMonth.revenue,
          )}
          todayValue={formatCurrency(stats.today.revenue)}
          yesterdayValue={formatCurrency(stats.yesterday.revenue)}
          lastMonthValue={formatCurrency(stats.lastMonth.revenue)}
        />

        <StatCard
          title="Conversions"
          mainStatValue={formatLargeNumber(stats.thisMonth.total_cv, 0)}
          percentChange={getPercentChange(
            stats.thisMonth.total_cv,
            stats.lastMonth.total_cv,
          )}
          todayValue={stats.today.total_cv.toString()}
          yesterdayValue={stats.yesterday.total_cv.toString()}
          lastMonthValue={formatLargeNumber(stats.lastMonth.total_cv)}
        />

        <StatCard
          title="CVR"
          mainStatValue={formatPercentage(stats.thisMonth.cvr)}
          percentChange={getPercentChange(
            stats.thisMonth.cvr,
            stats.lastMonth.cvr,
          )}
          todayValue={formatPercentage(stats.today.cvr)}
          yesterdayValue={formatPercentage(stats.yesterday.cvr)}
          lastMonthValue={formatPercentage(stats.lastMonth.cvr)}
        />

        <StatCard
          title="Events"
          mainStatValue={stats.thisMonth.event.toString()}
          percentChange={getPercentChange(
            stats.thisMonth.event,
            stats.lastMonth.event,
          )}
          todayValue={stats.today.event.toString()}
          yesterdayValue={stats.yesterday.event.toString()}
          lastMonthValue={stats.lastMonth.event.toString()}
        />

        <StatCard
          title="EVR"
          mainStatValue={formatPercentage(stats.thisMonth.evr)}
          percentChange={getPercentChange(
            stats.thisMonth.evr,
            stats.lastMonth.evr,
          )}
          todayValue={formatPercentage(stats.today.evr)}
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
  const percentChangeText = `${isPositive ? "+" : ""}${(percentChange * 100).toFixed(0)}%`;

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-slate-600">{title}</h3>

      <div className="mb-3">
        <div className="text-xs text-slate-500">Current Month</div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-slate-800">
            {mainStatValue}
          </span>
          <span
            className={`flex items-center text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
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
          <span className="text-slate-500">Today</span>
          <span className="font-medium text-slate-700">{todayValue}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Yesterday</span>
          <span className="font-medium text-slate-700">{yesterdayValue}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Last Month</span>
          <span className="font-medium text-slate-700">{lastMonthValue}</span>
        </div>
      </div>
    </div>
  );
};

export default PartnerSummaryStats;
