import React, { useEffect, useState } from "react";
import { bonusRate } from "../../data/bonusRate";
import { UseQueryResult } from "@tanstack/react-query";
import { Reporting } from "../../services/everflow/partner";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { FaLongArrowAltRight } from "react-icons/fa";
import { GrMoney } from "react-icons/gr";
import NumberRunning from "../animations/numberRunning";

type BonusRateProps = {
  summary: UseQueryResult<Reporting, Error>;
};
function BonusCaluator({ summary }: BonusRateProps) {
  const [targetBonusRate, setTargetBonusRate] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  const calculateBonus = ({
    payout,
  }: {
    payout: number;
  }): { bonus: number; targetRate: number } => {
    let bonus: number = 0;
    let targetRate: number = 0;
    for (const rate of bonusRate) {
      if (payout >= rate.from && payout <= rate.to) {
        bonus = payout * rate.rate;
        targetRate = rate.rate;
        break;
      }
    }

    if (payout > 500) {
      bonus = payout * 0.5;
      targetRate = 0.5;
    }
    return { bonus, targetRate };
  };

  useEffect(() => {
    if (summary.isSuccess) {
      const { bonus, targetRate } = calculateBonus({
        payout: summary.data?.payout as number,
      });
      setBonus(bonus);
      setTargetBonusRate(targetRate);
    }
  }, [summary.data]);

  return (
    <div className="flex h-max w-10/12 min-w-96 flex-col items-center justify-center gap-5 rounded-lg p-5 font-Poppins">
      <table className="w-96 table-auto border-collapse">
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
              <tr
                className={`${targetBonusRate === rate.rate ? " bg-yellow-500" : "bg-gray-200"}`}
                key={index}
              >
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
      <div className="flex w-full items-center justify-center gap-5">
        {summary.isLoading ? (
          <div
            className="flex h-9 min-w-96 animate-pulse items-center justify-center gap-2
         rounded-lg bg-gray-400  px-5 py-1 text-2xl font-semibold text-green-300 drop-shadow"
          ></div>
        ) : (
          <div
            className="flex min-w-96 items-center  justify-center gap-2 rounded-lg
         bg-green-300 px-5 py-1 text-2xl font-semibold text-green-700 drop-shadow"
          >
            <RiMoneyDollarCircleFill />
            {summary.data?.payout.toLocaleString()}
            <span className="text-lg font-normal text-green-700">
              Total Payout
            </span>
          </div>
        )}

        <FaLongArrowAltRight className="text-2xl text-green-700" />

        {summary.isLoading ? (
          <div
            className="flex h-9 min-w-96 animate-pulse items-center justify-center gap-2
         rounded-lg bg-gray-400  px-5 py-1 text-2xl font-semibold text-green-300 drop-shadow"
          ></div>
        ) : (
          <div
            className="flex min-w-96 items-center justify-center gap-2 rounded-lg
         bg-green-700 px-5 py-1 text-2xl font-semibold text-green-300 drop-shadow"
          >
            <GrMoney />
            <NumberRunning n={bonus} />$
            <span className="text-lg font-normal text-green-300">
              Total Bonus
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BonusCaluator;