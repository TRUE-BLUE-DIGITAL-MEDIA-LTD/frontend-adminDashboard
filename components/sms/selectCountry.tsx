import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";
import { Input, SearchField } from "react-aria-components";
import { FaRegCircle, FaRegCircleDot } from "react-icons/fa6";
import { IoSearchCircleSharp } from "react-icons/io5";
import { ResponseGetTraficSMSService } from "../../services/tools/sms";
import { countries } from "../../data/country";

type SelectCountryProps = {
  tariffs: UseInfiniteQueryResult<
    InfiniteData<ResponseGetTraficSMSService, unknown>,
    Error
  >;
  query: {
    country: number;
    service?: string | undefined;
    filterCountry?: string | undefined;
    filterService?: string | undefined;
  };
  setQuery: React.Dispatch<
    React.SetStateAction<{
      country: number;
      service?: string | undefined;
      filterCountry?: string | undefined;
      filterService?: string | undefined;
    }>
  >;
};
function SelectCountry({ tariffs, query, setQuery }: SelectCountryProps) {
  return (
    <section
      className="w-max rounded-lg border border-gray-100  bg-gradient-to-r 
 from-gray-50 to-gray-200 p-5 drop-shadow-xl"
    >
      {tariffs.isLoading && (
        <div
          className="absolute bottom-0 left-0 right-0 top-0 z-20 m-auto flex h-full
   w-full animate-pulse items-center justify-center rounded-lg bg-slate-200"
        >
          <div className="h-14 w-14 animate-spin rounded-full border-8 border-gray-300 border-t-blue-600" />
        </div>
      )}
      <h2 className="text-lg font-semibold">Select Country</h2>
      <SearchField className="relative mb-2 flex w-full flex-col">
        <Input
          value={query.filterCountry}
          onChange={(e) => {
            setQuery((prev) => {
              return {
                ...prev,
                filterCountry: e.target.value,
              };
            });
          }}
          placeholder="Search Country"
          className="h-10 appearance-none rounded-md p-5 pl-10 outline-0  ring-1 ring-gray-500
       placeholder:text-sm lg:w-full"
        />
        <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
      </SearchField>
      <ul className=" flex h-96 w-80 flex-col gap-2 overflow-auto">
        {tariffs.data &&
          Object.entries(
            tariffs.data.pages[tariffs.data.pages.length - 1].countries,
          ).map(([key, value]) => (
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
              className={`grid cursor-pointer grid-cols-4 items-center justify-between  
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
              <div className="col-span-2 flex items-center justify-start gap-2">
                <span>{value.name}</span>
                <span className="text-xs text-gray-500">+{value.code}</span>
              </div>
              <div className="flex justify-end pr-5">
                {query.country === value.code ? (
                  <FaRegCircleDot className="text-gray-800" />
                ) : (
                  <FaRegCircle />
                )}
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
}

export default SelectCountry;
