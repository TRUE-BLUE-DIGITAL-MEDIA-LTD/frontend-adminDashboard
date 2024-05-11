import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { GetTraficSMSService } from "../../services/tools/sms";
import Image from "next/image";
import { countries } from "../../data/country";
import { FaRegCircle, FaRegCircleDot } from "react-icons/fa6";

function SmsReceive() {
  const [query, setQuery] = useState<{
    country: number;
    filterCountry?: string;
    filterService?: string;
  }>({
    country: 66,
  });
  const tariffs = useQuery({
    queryKey: [
      "tariffs",
      {
        filterCountry: query?.filterCountry,
        filterService: query?.filterService,
      },
    ],
    queryFn: () =>
      GetTraficSMSService({
        country: query?.country as number,
        filter_country: query?.filterCountry as string,
        filter_service: query?.filterService as string,
        page: 1,
        lang: "en",
      }),
  });
  return (
    <div className="= min-h-screen pt-20 font-Poppins">
      <header className="flex w-full justify-start p-5">
        <h1 className="text-center text-3xl font-bold ">Receive SMS</h1>
      </header>
      <main className="p-5 ">
        <section
          className="w-max rounded-lg border border-gray-100  bg-gradient-to-r 
         from-gray-50 to-gray-200 p-5 drop-shadow-xl"
        >
          <ul className="m h-96 w-96 overflow-auto">
            {tariffs.data?.countries &&
              Object.entries(tariffs.data?.countries).map(([key, value]) => (
                <li
                  onClick={() =>
                    setQuery((prev) => {
                      return {
                        ...prev,
                        country: value.code,
                      };
                    })
                  }
                  key={key}
                  className={`grid grid-cols-4 items-center justify-between  
                   hover:bg-gray-200 ${query.country === value.code ? "bg-gray-200" : ""}`}
                >
                  <div className="relative h-10 w-10 overflow-hidden">
                    <Image
                      src={
                        countries.find((list) => list.country === value.name)
                          ?.flag as string
                      }
                      fill
                      alt="flag"
                      className="object-contain"
                    />
                  </div>
                  <span className="col-span-2">{value.name}</span>
                  {query.country === value.code ? (
                    <FaRegCircleDot className="text-gray-800" />
                  ) : (
                    <FaRegCircle />
                  )}
                </li>
              ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default SmsReceive;
