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
    <div className="flex h-max w-10/12 min-w-60 flex-col items-center justify-center gap-5 rounded-lg p-5 font-Poppins">
      <table className="w-60 table-auto border-collapse">
        <thead>
          <tr>
            <th className="border border-white bg-icon-color text-lg font-medium text-black ">
              FROM
            </th>
            <th className="border border-white bg-icon-color text-lg font-medium text-black ">
              TO
            </th>
            <th className="border border-white bg-icon-color text-lg font-medium text-black ">
              RATE
            </th>
          </tr>
        </thead>
        <tbody>
          {bonusRate.map((rate, index) => {
            return (
              <tr className="bg-gray-200" key={index}>
                <td className="border border-white  text-center text-lg font-normal text-black ">
                  ${rate.from}
                </td>
                <td className="border border-white  text-center   text-lg font-normal text-black ">
                  ${rate.to}
                </td>
                <td
                  className={`border border-white   text-center  text-lg ${rate.rate === 0.5 ? "font-bold text-yellow-700" : "font-normal text-black"}   `}
                >
                  {rate.rate * 100 + "%"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex w-full flex-col items-center justify-center gap-5 md:flex-row">
        {partnerPerformanceDayByDay.isLoading ? (
          <div
            className="flex h-9 min-w-60 animate-pulse items-center justify-center gap-2
         rounded-lg bg-gray-400  px-5 py-1 text-2xl font-semibold text-green-300 drop-shadow"
          ></div>
        ) : (
          <div
            className="flex min-w-60 items-center  justify-center gap-2 rounded-lg
         bg-green-300 px-5 py-1 text-2xl font-semibold text-green-700 drop-shadow"
          >
            <RiMoneyDollarCircleFill />
            {summary.data?.payout.toLocaleString()}
            <span className="text-sm  font-normal text-green-700">
              Total Payout
            </span>
          </div>
        )}

        <FaLongArrowAltRight className="text-2xl text-green-700" />

        {partnerPerformanceDayByDay.isLoading ? (
          <div
            className="flex h-9 min-w-60 animate-pulse items-center justify-center gap-2
         rounded-lg bg-gray-400  px-5 py-1 text-2xl font-semibold text-green-300 drop-shadow"
          ></div>
        ) : (
          <div
            className="flex min-w-60 items-center justify-center gap-2 rounded-lg
         bg-green-700 px-5 py-1 text-2xl font-semibold text-green-300 drop-shadow"
          >
            <GrMoney />
            <NumberRunning
              n={partnerPerformanceDayByDay.data?.totalBonus as number}
            />
            $
            <span className="text-sm font-normal text-green-300">
              Total Commission
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BonusCaluator;
