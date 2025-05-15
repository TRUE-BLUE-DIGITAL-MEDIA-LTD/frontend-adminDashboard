import React, { useEffect, useState } from "react";
import { HistoryRecord, Partner, User } from "../../models";
import {
  RequestUseGetHistories,
  useGetHistories,
} from "../../react-query/account-history";
import Image from "next/image";

type Props = {
  filter: RequestUseGetHistories;
  partner: Partner & { account: User };
};
function SummaryList({ partner, filter }: Props) {
  const history = useGetHistories({
    ...filter,
    filter: {
      ...filter.filter,
      userId: partner.account.id,
    },
  });
  const uniqueNumbers = history.data?.data
    .map((value) => ({
      ...value,
      phoneNumber: value.data.split(" ")[2],
    }))
    .filter((item, index, array) => {
      // Find the first index where the phoneNumber matches the current item's phoneNumber
      const firstIndex = array.findIndex(
        (otherItem) => otherItem.phoneNumber === item.phoneNumber,
      );
      // Return true if the current index is the first index found
      return index === firstIndex;
    });

  return (
    <tr>
      <td>
        <section className="flex items-center gap-2">
          <div className="relative h-10 w-10 rounded-lg ">
            <Image
              src={partner.account.image}
              layout="fill"
              alt="user image"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold leading-none">
              {partner.account.name}
            </span>
            <span className="text-xs text-gray-500">
              {partner.account.email}
            </span>
          </div>
        </section>
      </td>
      <td>
        {history.isLoading ? "Loading.." : uniqueNumbers?.length}/
        {history.data?.total_active_simcards}
      </td>
    </tr>
  );
}

export default SummaryList;
