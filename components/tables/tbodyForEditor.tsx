import React, { useEffect, useState } from "react";
import { TableEntry } from "../../services/everflow/partner";
import { useCalculateBonus } from "../../utils/useCaluateBonus";

type TbodyForEditorProps = {
  odd: number;
  item: TableEntry;
  setTotalBonus: React.Dispatch<React.SetStateAction<number>>;
};
function TbodyForEditor({ odd, item, setTotalBonus }: TbodyForEditorProps) {
  const bonous = useCalculateBonus({ payout: item.reporting.payout });

  useEffect(() => {
    setTotalBonus((prev) => prev + bonous);
  }, []);

  return (
    <tr
      className={`h-10 w-full text-sm  transition hover:bg-icon-color ${
        odd === 0 ? "bg-[#F7F6FE]" : "bg-white"
      }`}
    >
      <td
        className={`left-0 z-10 px-10 text-center md:sticky  ${
          odd === 0 ? "bg-[#F7F6FE]" : "bg-white"
        }`}
      >
        {item.columns[0].id}
      </td>
      <td
        className={`sticky left-0 z-10 max-w-60 truncate px-5 text-left text-xs md:left-[6.9rem]  ${
          odd === 0 ? "bg-[#F7F6FE]" : "bg-white"
        }`}
      >
        {item.columns[0].label}
      </td>

      <td className="px-5">{item.reporting.gross_click.toLocaleString()}</td>
      <td className="px-5">{item.reporting.total_click.toLocaleString()}</td>
      <td className="px-5">{item.reporting.unique_click.toLocaleString()}</td>
      <td className="px-5">
        {item.reporting.duplicate_click.toLocaleString()}
      </td>
      <td className="px-5">{item.reporting.invalid_click.toLocaleString()}</td>
      <td className="px-5">{item.reporting.cv.toLocaleString()}</td>

      <td className="px-5">{item.reporting.cvr}%</td>
      <td className="px-5">${item.reporting.cpc.toLocaleString()}</td>
      <td className="px-5 ">${item.reporting.cpa.toLocaleString()}</td>

      <td className="px-5 ">${item.reporting.payout.toLocaleString()}</td>
      <td className="px-5 font-bold text-yellow-600 ">
        ${bonous.toLocaleString()}
      </td>
    </tr>
  );
}

export default TbodyForEditor;
