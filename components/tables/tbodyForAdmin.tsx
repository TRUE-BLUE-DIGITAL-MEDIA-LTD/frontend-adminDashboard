import React from "react";
import { TableEntry } from "../../services/everflow/partner";

type TbodyForEditorProps = {
  odd: number;
  item: TableEntry;
};
function TbodyForAdmin({ odd, item }: TbodyForEditorProps) {
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
      <td className="px-5">
        ${item.reporting.media_buying_cost.toLocaleString()}
      </td>
      <td className="px-5">{item.reporting.gross_click.toLocaleString()}</td>
      <td className="px-5">{item.reporting.total_click.toLocaleString()}</td>
      <td className="px-5">{item.reporting.unique_click.toLocaleString()}</td>
      <td className="px-5">
        {item.reporting.duplicate_click.toLocaleString()}
      </td>
      <td className="px-5">{item.reporting.invalid_click.toLocaleString()}</td>
      <td className="px-5">{item.reporting.total_cv.toLocaleString()}</td>
      <td className="px-5">{item.reporting.cv.toLocaleString()}</td>

      <td className="px-5">{item.reporting.cvr}%</td>
      <td className="px-5">${item.reporting.cpc.toLocaleString()}</td>
      <td className="px-5 ">${item.reporting.cpa.toLocaleString()}</td>
      <td className="px-5 ">${item.reporting.rpc.toLocaleString()}</td>
      <td className="px-5 ">${item.reporting.rpa.toLocaleString()}</td>
      <td className="px-5 ">${item.reporting.revenue.toLocaleString()}</td>
      <td className="px-5 ">${item.reporting.payout.toLocaleString()}</td>
      <td className="px-5 ">${item.reporting.profit.toLocaleString()}</td>
      <td className="px-5 ">{item.reporting.margin.toLocaleString()}%</td>
    </tr>
  );
}

export default TbodyForAdmin;
