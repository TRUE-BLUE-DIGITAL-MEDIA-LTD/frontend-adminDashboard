import React from "react";
import { Reporting } from "../../services/everflow/partner";
import { UseQueryResult } from "@tanstack/react-query";
import { User } from "../../models";

type SummaryReportProps = {
  summary: UseQueryResult<Reporting, Error>;
  user: User;
};

const metrics: { label: string; key: keyof Reporting; suffix?: string }[] = [
  { label: "Media Buying Cost", key: "media_buying_cost" },
  { label: "Gross Clicks", key: "gross_click" },
  { label: "Clicks", key: "total_click" },
  { label: "Total CV", key: "total_cv" },
  { label: "CTR", key: "ctr", suffix: "%" },
  { label: "Event", key: "event" },
  { label: "CVR", key: "cvr", suffix: "%" },
  { label: "CPC", key: "cpc" },
  { label: "CPA", key: "cpa" },
  { label: "RPC", key: "rpc" },
  { label: "RPA", key: "rpa" },
  { label: "Payout", key: "payout" },
  { label: "Revenue", key: "revenue" },
  { label: "Profit", key: "profit" },
  { label: "Margin", key: "margin", suffix: "%" },
  { label: "Avg. Sale Value", key: "avg_sale_value" },
  { label: "Gross Sales", key: "gross_sales" },
];

function SummaryReport({ summary }: SummaryReportProps) {
  return (
    <section className="w-full rounded-2xl border border-line bg-panel p-4 md:p-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {metrics.map((m) => {
          const raw = summary.data?.[m.key];
          const value =
            typeof raw === "number" ? raw.toLocaleString() : undefined;
          return (
            <div
              key={m.label}
              className="rounded-xl border border-line bg-surface/30 px-3 py-3"
            >
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
                {m.label}
              </h2>
              {summary.isLoading ? (
                <div className="mt-2 h-6 w-16 animate-pulse rounded bg-panel-raised" />
              ) : (
                <p className="mt-1 text-lg font-semibold tracking-tight text-fg">
                  {value}
                  {m.suffix ?? ""}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SummaryReport;
