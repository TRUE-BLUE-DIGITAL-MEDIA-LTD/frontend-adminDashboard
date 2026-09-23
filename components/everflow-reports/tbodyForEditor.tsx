import React, { memo, useEffect, useState } from "react";
import { Column, TableEntry } from "../../services/everflow/partner";
import { UseQueryResult } from "@tanstack/react-query";
import { IoMdArrowDropdown } from "react-icons/io";
import { Partner, User } from "../../models";

type TbodyForEditorProps = {
  user: User & { partner: Partner | null };
  onTriggerConversion: (column: Column[]) => void;
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
  setActiveColumnDropdown?: React.Dispatch<
    React.SetStateAction<
      | {
          key: string;
          child?: string;
          active: boolean;
        }[]
      | undefined
    >
  >;
  activeColumnDropdown?: {
    key: string;
    child?: string;
    active: boolean;
  }[];
  partner?: [
    string,
    {
      summary: TableEntry;
      entries: TableEntry[];
    },
  ];
  isGroupedChild?: boolean;
  isGrandchild?: boolean;
  parentId?: string;
};
function TbodyForEditor({
  odd,
  user,
  item,
  partner,
  activeColumnDropdown,
  setActiveColumnDropdown,
  partnerPerformanceDayByDay,
  onTriggerConversion,
  isGroupedChild,
  isGrandchild,
  parentId,
}: TbodyForEditorProps) {
  const bonos = partnerPerformanceDayByDay.data?.partner.find(
    (list) => list.id === item.columns[0]?.id,
  );

  const isParent = !!partner;

  const stickyClass = isParent
    ? "sticky top-16 z-20 shadow-sm"
    : isGroupedChild
      ? "sticky top-[6.5rem] z-10 shadow-sm"
      : "";

  const bgClass = isParent
    ? "bg-zinc-800"
    : isGroupedChild
      ? "bg-zinc-900"
      : "bg-zinc-900";

  const fontClass = isParent
    ? "font-bold text-white"
    : isGroupedChild
      ? "font-semibold text-zinc-200"
      : "text-zinc-400";

  return (
    <tr
      className={`h-10 w-full text-sm transition hover:bg-white/5 border-b border-white/5 ${stickyClass} ${bgClass} ${fontClass}`}
    >
      <td
        className={`left-0 max-w-60 truncate px-2 text-end md:sticky ${bgClass}`}
      >
        {(partner &&
          (activeColumnDropdown?.find(
            (value) => value.key === partner?.[1].summary.columns[0]?.id,
          )?.active === true ||
            activeColumnDropdown?.find(
              (value) => value.key === partner?.[1].summary.columns[0]?.id,
            )?.active === false)) ||
        (isGroupedChild &&
          parentId &&
          (activeColumnDropdown?.find(
            (value) =>
              value.key === parentId && value.child === item.columns[1]?.id,
          )?.active === true ||
            activeColumnDropdown?.find(
              (value) =>
                value.key === parentId && value.child === item.columns[1]?.id,
            )?.active === false)) ? (
          <div
            onClick={() => {
              setActiveColumnDropdown?.((prev) =>
                prev?.map((value) => {
                  if (
                    partner &&
                    value.key === partner?.[1].summary.columns[0]?.id &&
                    !value.child
                  ) {
                    return { ...value, active: !value.active };
                  }
                  if (
                    isGroupedChild &&
                    parentId &&
                    value.key === parentId &&
                    value.child === item.columns[1]?.id
                  ) {
                    return { ...value, active: !value.active };
                  }
                  return value;
                }),
              );
            }}
            className="grid cursor-pointer grid-cols-3 p-2 hover:bg-white/10"
          >
            <div
              className={`flex items-center justify-center ${
                isGroupedChild ? "pl-4" : ""
              }`}
            >
              <IoMdArrowDropdown />
            </div>

            {isGroupedChild ? item.columns[1]?.id : item.columns[0]?.id}
          </div>
        ) : (
          <div className={`${isGrandchild ? "pl-8" : ""}`}>
            {isGrandchild
              ? item.columns[2]?.id
              : isGroupedChild
                ? item.columns[1]?.id
                : item.columns[0]?.id}
          </div>
        )}
      </td>
      <td
        className={`sticky left-0 max-w-40 truncate px-2 text-left text-xs md:w-max md:max-w-max ${bgClass}`}
      >
        <div
          className={`${isGrandchild ? "pl-8" : isGroupedChild ? "pl-4" : ""}`}
        >
          {partner
            ? item.columns[0]?.label
            : isGrandchild
              ? item.columns[2]?.label
              : item.columns[1]
                ? item.columns[1]?.label
                : item.columns[0]?.label}
        </div>
      </td>

      <td className="px-2">{item.reporting.gross_click.toLocaleString()}</td>
      <td className="px-2">{item.reporting.unique_click.toLocaleString()}</td>
      <td className="px-2">
        {item.reporting.duplicate_click.toLocaleString()}
      </td>
      <td className="px-2">{item.reporting.invalid_click.toLocaleString()}</td>
      <td
        onClick={() => {
          if (!isGrandchild && !isGroupedChild) {
            onTriggerConversion(item.columns);
          }
          if (isGrandchild) {
            onTriggerConversion(item.columns);
          }

          if (isGroupedChild) {
            console.log(item.columns.slice(0, 2));
            onTriggerConversion(item.columns.slice(0, 2));
          }
        }}
        className="cursor-pointer px-2 text-main-color hover:underline"
      >
        {item.reporting.cv.toLocaleString()}
      </td>

      <td className="px-2">{item.reporting.cvr?.toFixed(2)}%</td>
      <td className="px-2">{item.reporting.event}</td>
      <td className="px-2">{item.reporting.evr?.toFixed(2)}%</td>

      <td className="px-2">{item.reporting.cpc.toLocaleString()}</td>

      <td className="px-2 ">{item.reporting.payout.toLocaleString()}</td>
      {partnerPerformanceDayByDay.isLoading ? (
        <td className="animate-pulse px-2 font-bold text-amber-300">
          loading..
        </td>
      ) : (
        user.partner?.isAllowBonuSystem && (
          <td className="px-2 font-bold text-amber-300 ">
            ${bonos?.bonus.toLocaleString()}
          </td>
        )
      )}
    </tr>
  );
}

export default memo(TbodyForEditor);
