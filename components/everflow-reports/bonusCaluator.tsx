import React, { useEffect, useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { Reporting } from "../../services/everflow/partner";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { FaLongArrowAltRight } from "react-icons/fa";
import { GrMoney } from "react-icons/gr";
import NumberRunning from "../animations/numberRunning";

type BonusRateProps = {
  summary: UseQueryResult<Reporting, Error>;
  bonusRate: {
    from: number;
    to: number;
    rate: number;
  }[];
  partnerPerformanceDayByDay: UseQueryResult<
    {
      partner: {
        id: string;
        bonus: number;
      }[];
      totalBonus: number;
    },
    Error
  >;
};
function BonusCaluator({
  summary,
  partnerPerformanceDayByDay,
  bonusRate,
}: BonusRateProps) {
  return (
    <div className="flex h-max w-full min-w-60 flex-col items-center justify-center gap-5 rounded-2xl border border-white/10 bg-zinc-900 p-4 font-Poppins md:p-5">
      <table className="w-60 table-auto border-collapse overflow-hidden rounded-xl">
        <thead>
          <tr>
            <th className="border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              From
            </th>
            <th className="border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              To
            </th>
            <th className="border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {bonusRate.map((rate, index) => {
            return (
              <tr className="border-b border-white/5 bg-black/20" key={index}>
                <td className="px-3 py-2 text-center text-sm font-normal text-zinc-200">
                  ${rate.from}
                </td>
                <td className="px-3 py-2 text-center text-sm font-normal text-zinc-200">
                  ${rate.to}
                </td>
                <td
                  className={`px-3 py-2 text-center text-sm ${rate.rate === 0.5 ? "font-semibold text-amber-300" : "font-normal text-zinc-200"}`}
                >
                  {rate.rate * 100 + "%"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row">
        {partnerPerformanceDayByDay.isLoading ? (
          <div className="flex h-9 min-w-60 animate-pulse items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-1"></div>
        ) : (
          <div className="flex min-w-60 items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-5 py-2 text-xl font-semibold text-emerald-300">
            <RiMoneyDollarCircleFill />
            {summary.data?.payout.toLocaleString()}
            <span className="text-sm font-normal text-emerald-400/80">
              Total Payout
            </span>
          </div>
        )}

        <FaLongArrowAltRight className="text-xl text-zinc-500" />

        {partnerPerformanceDayByDay.isLoading ? (
          <div className="flex h-9 min-w-60 animate-pulse items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-1"></div>
        ) : (
          <div className="flex min-w-60 items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-5 py-2 text-xl font-semibold text-emerald-200">
            <GrMoney />
            <NumberRunning
              n={partnerPerformanceDayByDay.data?.totalBonus as number}
            />
            $
            <span className="text-sm font-normal text-emerald-300/80">
              Total Commission
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BonusCaluator;
