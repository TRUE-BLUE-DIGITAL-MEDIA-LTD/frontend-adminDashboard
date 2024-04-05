import React, { useEffect, useState } from "react";
import { TableEntry } from "../../services/everflow/partner";
import { UseQueryResult } from "@tanstack/react-query";
import { IoMdArrowDropdown } from "react-icons/io";

type TbodyForEditorProps = {
  odd: number;
  item: TableEntry;
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
  setActivePartnerDropdowns?: React.Dispatch<
    React.SetStateAction<
      | {
          key: string;
          active: boolean;
        }[]
      | undefined
    >
  >;
  activePartnerDropdowns?: {
    key: string;
    active: boolean;
  }[];
  partner?: [
    string,
    {
      summary: TableEntry;
      entries: TableEntry[];
    },
  ];
};
function TbodyForEditor({
  odd,
  item,
  partner,
  activePartnerDropdowns,
  setActivePartnerDropdowns,
  partnerPerformanceDayByDay,
}: TbodyForEditorProps) {
  const bonos = partnerPerformanceDayByDay.data?.partner.find(
    (list) => list.id === item.columns[0].id,
  );

  return (
    <tr
      className={`h-10 w-full text-sm ${activePartnerDropdowns && "font-bold"}  transition hover:bg-icon-color ${
        odd === 0 ? "bg-[#F7F6FE]" : "bg-white"
      }`}
    >
      <td
        className={`left-0 z-10 px-2 text-end md:sticky  ${
          odd === 0 ? "bg-[#F7F6FE]" : "bg-white"
        }`}
      >
        {activePartnerDropdowns?.find(
          (value) => value.key === partner?.[1].summary.columns[0].label,
        )?.active === true ||
        activePartnerDropdowns?.find(
          (value) => value.key === partner?.[1].summary.columns[0].label,
        )?.active === false ? (
          <div
            onClick={() => {
              setActivePartnerDropdowns?.((prev) =>
                prev?.map((value) =>
                  value.key === partner?.[1].summary.columns[0].label
                    ? { ...value, active: !value.active }
                    : value,
                ),
              );
            }}
            className="grid cursor-pointer grid-cols-3 p-2 hover:bg-slate-200"
          >
            <IoMdArrowDropdown />

            {item.columns[0].id}
          </div>
        ) : (
          <div>{item.columns[0].id}</div>
        )}
      </td>
      <td
        className={`sticky left-0 z-10   px-2 text-left text-xs md:left-[6.9rem]  ${
          odd === 0 ? "bg-[#F7F6FE]" : "bg-white"
        }`}
      >
        {activePartnerDropdowns ? item.columns[0].label : item.columns[1].label}
      </td>

      <td className="px-2">{item.reporting.gross_click.toLocaleString()}</td>
      <td className="px-2">{item.reporting.total_click.toLocaleString()}</td>
      <td className="px-2">{item.reporting.unique_click.toLocaleString()}</td>
      <td className="px-2">
        {item.reporting.duplicate_click.toLocaleString()}
      </td>
      <td className="px-2">{item.reporting.invalid_click.toLocaleString()}</td>
      <td className="px-2">{item.reporting.cv.toLocaleString()}</td>

      <td className="px-2">{item.reporting.cvr}%</td>
      <td className="px-2">${item.reporting.cpc.toLocaleString()}</td>
      <td className="px-2 ">${item.reporting.cpa.toLocaleString()}</td>

      <td className="px-2 ">${item.reporting.payout.toLocaleString()}</td>
      {partnerPerformanceDayByDay.isLoading ? (
        <td className="animate-pulse px-2 font-bold text-yellow-600">
          loading..
        </td>
      ) : (
        <td className="px-2 font-bold text-yellow-600 ">
          ${bonos?.bonus.toLocaleString()}
        </td>
      )}
    </tr>
  );
}

export default TbodyForEditor;
