import React, { memo } from "react";
import { Input, SearchField } from "react-aria-components";
import { IoSearchCircleSharp } from "react-icons/io5";
import { services } from "../../data/services";

import { useGetAvailableNumberPVA } from "../../react-query";
import ServiceCard from "./ServiceCard";

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
          .filter(
            (service): service is typeof service & { code: string } =>
              !!service.code,
          )
          .map((service, index) => {
            const numbers = availableNumbers.data?.find(
              (number) => number.service === service.code,
            );
            return (
              <ServiceCard
                country={country}
                key={index}
                selectService={selectService}
                service={service}
                loadingNumberAvailable={availableNumbers.isLoading}
                totalAvailable={numbers?.total ?? 0}
                onSelectService={(service) => onSelectService(service)}
              />
            );
          })}
      </ul>
    </section>
  );
}

export default memo(SelectService);
