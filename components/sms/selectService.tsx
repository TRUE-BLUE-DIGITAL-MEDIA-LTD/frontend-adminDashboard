import Image from "next/image";
import React, { useEffect } from "react";
import { Input, SearchField } from "react-aria-components";
import { FaRegCircle } from "react-icons/fa6";
import { IoSearchCircleSharp } from "react-icons/io5";
import { services } from "../../data/services";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import {
  GetActiveNumberSMSService,
  RequestNumberSMSService,
  ResponseGetActiveNumberSMSService,
  ResponseGetTraficSMSService,
} from "../../services/tools/sms";
import { useInView } from "react-intersection-observer";
import { ErrorMessages } from "../../models";
import Swal from "sweetalert2";

type SelectServiceProps = {
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
  activeNumber: UseQueryResult<ResponseGetActiveNumberSMSService, Error>;
};
function SelectService({
  tariffs,
  query,
  setQuery,
  activeNumber,
}: SelectServiceProps) {
  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView) {
      tariffs.fetchNextPage();
    }
  }, [inView]);

  const handleRequestNumber = async ({
    service_slug,
  }: {
    service_slug: string;
  }) => {
    try {
      if (!service_slug || !query.country) {
        throw new Error("Please select a service and country");
      }
      Swal.fire({
        title: "Loading",
        text: "Please wait.",
        allowEscapeKey: false,
        allowOutsideClick: false,
        showConfirmButton: false,
        allowEnterKey: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      const number = await RequestNumberSMSService({
        country: query.country,
        service: service_slug as string,
      });
      console.log(number);
      if (number.response !== 1) {
        throw new Error(number.response as string);
      }
      await activeNumber.refetch();
      Swal.fire({
        title: "Success",
        text: "Request number successfully",
        icon: "success",
      });
    } catch (error) {
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result.message.toString(),
        footer: result.statusCode
          ? "Error code: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  return (
    <section
      className="relative w-max rounded-lg border border-gray-100  bg-gradient-to-r 
 from-gray-50 to-gray-200 p-5 drop-shadow-xl"
    >
      {tariffs.isFetchingNextPage && (
        <div
          className="absolute bottom-0 left-0 right-0 top-0 z-20 m-auto flex h-full
   w-full animate-pulse items-center justify-center rounded-lg bg-slate-200"
        >
          <div className="h-14 w-14 animate-spin rounded-full border-8 border-gray-300 border-t-blue-600" />
        </div>
      )}
      <h2 className=" text-lg font-semibold">Select Service</h2>
      <SearchField className="relative mb-2 flex w-full flex-col">
        <Input
          value={query.filterService}
          onChange={(e) => {
            setQuery((prev) => {
              return {
                ...prev,
                filterService: e.target.value,
              };
            });
          }}
          placeholder="Search Service"
          className="h-10 appearance-none rounded-md p-5 pl-10 outline-0  ring-1 ring-gray-500
       placeholder:text-sm lg:w-full"
        />
        <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
      </SearchField>
      <ul className="  flex h-96 w-96 flex-col gap-2 overflow-auto px-5">
        {tariffs.isLoading
          ? [...Array(8)].map((list, index) => {
              return (
                <li
                  key={index}
                  className="grid animate-pulse grid-cols-5 items-center justify-between  bg-gray-200"
                >
                  <div className="h-10 w-10 bg-gray-300"></div>
                  <span className="col-span-3 bg-gray-300"></span>
                  <FaRegCircle className="text-gray-800" />
                </li>
              );
            })
          : tariffs.data &&
            tariffs.data.pages.map((page, index) => {
              return Object.entries(page.services).map(
                ([key, value], index, array) => (
                  <li
                    ref={array.length === index + 1 ? ref : undefined}
                    key={key}
                    className={`grid cursor-pointer grid-cols-5 items-center justify-between p-2  
           hover:bg-gray-200 ${query.service === value.slug ? "bg-gray-200" : ""}`}
                  >
                    <div className="relative h-10 w-10 overflow-hidden ">
                      <Image
                        src={
                          (services.find((list) => list.slug === value.slug)
                            ?.icon as string) ?? "/favicon.ico"
                        }
                        fill
                        alt="flag"
                        className="object-contain"
                      />
                    </div>
                    <span className="col-span-3 text-base">
                      {value.service}
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-normal text-gray-400">
                        {value.count}
                      </span>
                      <button
                        onClick={() =>
                          handleRequestNumber({ service_slug: value.slug })
                        }
                        className="rounded-lg bg-blue-200 px-2 py-1 text-sm
               font-semibold text-blue-700 transition duration-100 hover:bg-blue-300 active:scale-105"
                      >
                        ${value.price}
                      </button>
                    </div>
                  </li>
                ),
              );
            })}
      </ul>
    </section>
  );
}

export default SelectService;
