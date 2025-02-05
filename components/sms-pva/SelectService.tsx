import Image from "next/image";
import React, { useEffect } from "react";
import { Input, SearchField } from "react-aria-components";
import { FaRegCircle } from "react-icons/fa6";
import { IoSearchCircleSharp } from "react-icons/io5";
import { services } from "../../data/services";

import { ErrorMessages } from "../../models";
import Swal from "sweetalert2";
import {
  useCreateSmsPva,
  useGetAllPricePVA,
  useGetAvailableNumberPVA,
} from "../../react-query";

type SelectServiceProps = {
  selectService: string;
  onSelectService: (value: string) => void;
  country: string;
};
function SelectService({
  selectService,
  country,
  onSelectService,
}: SelectServiceProps) {
  const availableNumbers = useGetAvailableNumberPVA({ country: country });
  // const allPrice = useGetAllPricePVA();
  const [query, setQuery] = React.useState<string>("");
  const [serviceData, setServiceData] = React.useState(services);
  const handleFilterService = (query: string) => {
    setQuery(query);
    const filteredServices = services.filter(
      (service) =>
        service.slug.toLowerCase().includes(query.toLowerCase()) ||
        service.title.toLowerCase().includes(query.toLowerCase()),
    );
    setServiceData(filteredServices);
  };

  return (
    <section
      className="relative w-max rounded-lg border border-gray-100  bg-gradient-to-r 
 from-gray-50 to-gray-200 p-5 drop-shadow-xl"
    >
      <h2 className=" text-lg font-semibold">Select Service</h2>
      <SearchField className="relative mb-2 flex w-full flex-col">
        <Input
          value={query}
          onChange={(e) => {
            handleFilterService(e.target.value);
          }}
          placeholder="Search Service"
          className="h-10 appearance-none rounded-md p-5 pl-10 outline-0  ring-1 ring-gray-500
       placeholder:text-sm lg:w-full"
        />
        <IoSearchCircleSharp className="text-super-main-color absolute bottom-0 left-2 top-0 m-auto text-3xl" />
      </SearchField>
      <ul className="  flex h-96 w-96 flex-col gap-2 overflow-auto px-5">
        {serviceData
          .filter((service) => service.code)
          .map((service, index) => {
            const numbers = availableNumbers.data?.find(
              (number) => number.service === service.code,
            );
            return (
              <li
                key={index}
                className={` flex  cursor-pointer items-center justify-between p-2  
           hover:bg-gray-200 ${selectService === service.slug ? "bg-gray-200" : ""}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="relative h-10 w-10 overflow-hidden ">
                    <Image
                      src={service.icon ?? "/favicon.ico"}
                      fill
                      alt="flag"
                      className="object-contain"
                    />
                  </div>
                  <span className="col-span-3 text-base">{service.title}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {availableNumbers.isLoading ? (
                    <div className="h-2 w-5 animate-pulse rounded-full bg-gray-400"></div>
                  ) : (
                    <span className="text-sm font-normal text-gray-400">
                      {numbers?.total}
                    </span>
                  )}

                  <button
                    onClick={() => {
                      onSelectService(service.code ?? "");
                    }}
                    className={`w-24 rounded-lg bg-blue-200 px-2 py-1 text-sm
                
               font-semibold text-blue-700 transition duration-100 hover:bg-blue-300 active:scale-105`}
                  >
                    {/* {allPrice.isLoading
                    ? "Loading..."
                    : price
                      ? `${price.price} $`
                      : "NO SERVICE"} */}
                    Select
                  </button>
                </div>
              </li>
            );
          })}
      </ul>
    </section>
  );
}

export default SelectService;
