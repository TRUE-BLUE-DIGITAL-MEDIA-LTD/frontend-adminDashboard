import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  GetActiveNumberSMSService,
  GetBalacneSMSService,
  GetTraficSMSService,
} from "../../services/tools/sms";
import Image from "next/image";
import { countries } from "../../data/country";
import { FaRegCircle, FaRegCircleDot } from "react-icons/fa6";
import { useInView } from "react-intersection-observer";
import { Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import { services } from "../../data/services";
import SelectCountry from "./selectCountry";
import SelectService from "./selectService";
import ShowActiveNumber from "./showActiveNumber";

function SmsReceive() {
  const [query, setQuery] = useState<{
    country: number;
    service?: string;
    filterCountry?: string;
    filterService?: string;
  }>({
    country: 66,
  });
  const activeNumber = useQuery({
    queryKey: ["active-number"],
    queryFn: () => GetActiveNumberSMSService(),
    refetchInterval: 1000 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
  const balance = useQuery({
    queryKey: ["balance"],
    queryFn: () => GetBalacneSMSService(),
    refetchInterval: 1000 * 5,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
  const tariffs = useInfiniteQuery({
    queryKey: [
      "tariffs",
      {
        country: query?.country,
        filterCountry: query?.filterCountry,
        filterService: query?.filterService,
      },
    ],
    queryFn: ({ pageParam }) => {
      return GetTraficSMSService({
        country: query?.country as number,
        filter_country: query?.filterCountry as string,
        filter_service: query?.filterService as string,
        page: Number(pageParam),
        lang: "en",
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.end === false) {
        return lastPage.page + 1;
      } else {
        return undefined;
      }
    },
    initialPageParam: 1,
  });

  return (
    <div className="= min-h-screen pt-20 font-Poppins">
      <header className="flex w-full flex-col justify-start p-5">
        <h1 className="text-center text-3xl font-bold ">Receive SMS</h1>
        {balance.data && (
          <h2 className="mt-2 flex h-6 items-center justify-center text-center text-xl font-bold ">
            {balance.isFetching ? (
              <div className="h-6 w-40 animate-pulse rounded-sm bg-gray-400" />
            ) : (
              <span>
                Balance $
                {Number(balance.data?.balance) - balance.data?.zbalance}
              </span>
            )}
          </h2>
        )}
        <h3 className="flex h-6 items-center justify-center text-center text-lg font-normal ">
          {balance.isFetching ? (
            <div className="h-6 w-40 animate-pulse rounded-sm bg-gray-200" />
          ) : (
            <span>Frozen balance: {balance.data?.zbalance}</span>
          )}
        </h3>
        <ShowActiveNumber activeNumber={activeNumber} />
      </header>

      <main className="flex items-start justify-center gap-2 p-5 ">
        <SelectCountry tariffs={tariffs} query={query} setQuery={setQuery} />
        <SelectService
          tariffs={tariffs}
          query={query}
          setQuery={setQuery}
          activeNumber={activeNumber}
        />
      </main>
    </div>
  );
}

export default SmsReceive;
