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
    <section className="w-10/12 grid gap-5 grid-cols-8 h-max p-5 rounded-lg ring-1 ring-black">
      <div>
        <h2 className="text-xs font-semibold w-max">MEDIA BUYING COST</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-300 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            ${summary.data?.media_buying_cost.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">GROSS CLICKS</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-100 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            {summary.data?.gross_click.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">CLICKS</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-300 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            {summary.data?.total_click.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">TOTAL CV</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-200 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            {summary.data?.total_cv.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">CTR</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-400 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            {summary.data?.ctr.toLocaleString()}%
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">EVENT</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-200 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            {summary.data?.event.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">CVR</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-50 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            {summary.data?.cvr.toLocaleString()}%
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">CPC</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-500 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            ${summary.data?.cpc.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">CPA</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-200 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            ${summary.data?.cpa.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">RPC</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-300 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            ${summary.data?.rpc.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">RPA</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-600 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            ${summary.data?.rpa.toLocaleString()}
          </p>
        )}
      </div>
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
      <div>
        <h2 className="text-xs font-semibold w-max">REVENUE</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-50 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            ${summary.data?.revenue.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">PROFIT</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-400 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            ${summary.data?.profit.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">MARGIN</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-700 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            {summary.data?.margin.toLocaleString()}%
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">AVG. SALE VALUE</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-300 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            ${summary.data?.avg_sale_value.toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-xs font-semibold w-max">GROSS SALES</h2>
        {summary.isLoading ? (
          <div className="w-full h-5 bg-gray-300 animate-pulse "></div>
        ) : (
          <p className="text-base text-slate-600 font-semibold w-max">
            ${summary.data?.gross_sales.toLocaleString()}
          </p>
        )}
      </div>
    </section>
  );
}

export default SummaryReport;
