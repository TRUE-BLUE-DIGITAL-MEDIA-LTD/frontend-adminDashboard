import React from "react";
import { Reporting } from "../../services/everflow/partner";
import { UseQueryResult } from "@tanstack/react-query";
import { User } from "../../models";

type SummaryReportProps = {
  summary: UseQueryResult<Reporting, Error>;
  user: User;
};
function SummaryReport({ summary }: SummaryReportProps) {
  return (
    <section className="grid h-max w-10/12 grid-cols-2 gap-5 rounded-lg p-5 ring-1 ring-black md:grid-cols-6 2xl:grid-cols-8">
      <div>
        <h2 className="w-max text-xs font-semibold">MEDIA BUYING COST</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-300 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.media_buying_cost.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">GROSS CLICKS</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-100 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.gross_click.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">CLICKS</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-300 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.total_click.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">TOTAL CV</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-200 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.total_cv.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">CTR</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-400 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.ctr.toLocaleString()}%
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">EVENT</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-200 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.event.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">CVR</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-50 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.cvr.toLocaleString()}%
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">CPC</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-500 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.cpc.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">CPA</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-200 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.cpa.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">RPC</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-300 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.rpc.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">RPA</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-600 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.rpa.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">PAYOUT</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-300 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.payout.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">REVENUE</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-50 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.revenue.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">PROFIT</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-400 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.profit.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">MARGIN</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-700 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.margin.toLocaleString()}%
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">AVG. SALE VALUE</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-300 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.avg_sale_value.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="w-max text-xs font-semibold">GROSS SALES</h2>
        {summary.isLoading ? (
          <div className="h-5 w-full animate-pulse bg-gray-300 "></div>
        ) : (
          <p className="w-max text-base font-semibold text-slate-600">
            {summary.data?.gross_sales.toLocaleString()}
          </p>
        )}
      </div>
    </section>
  );
}

export default SummaryReport;
