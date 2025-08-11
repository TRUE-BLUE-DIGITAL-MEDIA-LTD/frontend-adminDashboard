import React, { useState } from "react";
import {
  useCreateSMSPool,
  useGetCountrySMSPool,
  useGetServiceSMSPool,
  useGetStockSMSpool,
} from "../../react-query/sms-pool";
import { Country, ErrorMessages, Service } from "../../models";
import {
  Dropdown,
  DropdownChangeEvent,
  DropdownProps,
} from "primereact/dropdown";
import Image from "next/image";
import Swal from "sweetalert2";
import { UseQueryResult } from "@tanstack/react-query";
import { ResponseGetSmsPoolService } from "../../services/sms-pool";
import { poolList } from "../../data/sms-pool-list";

type Props = {
  activeNumbers: UseQueryResult<ResponseGetSmsPoolService, Error>;
};
function SelectService({ activeNumbers }: Props) {
  const country = useGetCountrySMSPool();
  const service = useGetServiceSMSPool();
  const [loading, setLoading] = useState<boolean>(false);
  const buy = useCreateSMSPool();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectService, setSelectService] = useState<Service | null>(null);
  const [selectPool, setSelectPool] = useState<{ ID: number; name: string }>({
    ID: 0,
    name: "Default",
  });
  const stock = useGetStockSMSpool({
    service: selectService?.ID.toString() as string,
    country: selectedCountry?.ID.toString() as string,
    pool: selectPool.ID.toString(),
  });

  const panelFooterTemplate = () => {
    return (
      <div className="px-3 py-2">
        {selectedCountry ? (
          <span>
            <b>{selectedCountry.name}</b> selected.
          </span>
        ) : (
          "No country selected."
        )}
      </div>
    );
  };
  const countryOptionTemplate = (option: Country) => {
    return (
      <div className="align-items-center flex gap-2">
        <div className="relative h-5 w-5 overflow-hidden">
          <Image
            src={`/image/flags/1x1/${option.short_name}.svg`}
            fill
            alt="flag"
            className="object-contain"
          />
        </div>
        <div>{option.name}</div>
      </div>
    );
  };

  const serviceOptionTemplate = (option: Service) => {
    return (
      <div className="align-items-center flex w-96 gap-2">
        <div>{option.name}</div>
      </div>
    );
  };

  const selectedCountryTemplate = (option: Country, props: DropdownProps) => {
    if (option) {
      return (
        <div className="align-items-center flex gap-2">
          <div className="relative h-5 w-5 overflow-hidden">
            <Image
              src={`/image/flags/1x1/${option.short_name}.svg`}
              fill
              alt="flag"
              className="object-contain"
            />
          </div>
          <div>{option.name}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const handleBuySms = async () => {
    try {
      setLoading(true);
      await buy.mutateAsync({
        service: selectService?.ID.toString() as string,
        country: selectedCountry?.ID.toString() as string,
        pool: selectPool.ID.toString(),
      });
      await activeNumbers.refetch();
      Swal.fire({
        title: "Success",
        text: "Number has been successfully created.",
        icon: "success",
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
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
    <div className="flex flex-col gap-2 rounded-lg border bg-gray-100 p-5 font-Poppins">
      <Dropdown
        value={selectedCountry}
        onChange={(e: DropdownChangeEvent) => setSelectedCountry(e.value)}
        options={country.data?.sort((a, b) => a.name.localeCompare(b.name))}
        loading={country.isLoading}
        optionLabel="name"
        placeholder="Select a Country"
        valueTemplate={selectedCountryTemplate}
        itemTemplate={countryOptionTemplate}
        className="w-96 border"
        panelFooterTemplate={panelFooterTemplate}
      />

      <Dropdown
        value={selectService}
        onChange={(e: DropdownChangeEvent) => setSelectService(e.value)}
        options={service.data}
        loading={service.isLoading}
        optionLabel="name"
        placeholder="Select a Service"
        className="w-96 border"
        itemTemplate={serviceOptionTemplate}
      />

      <Dropdown
        value={selectPool}
        onChange={(e: DropdownChangeEvent) => setSelectPool(e.value)}
        options={poolList}
        optionLabel="name"
        placeholder="Select a Pool"
        className="w-96 border"
        itemTemplate={serviceOptionTemplate}
      />

      <div className="flex h-10 w-96 items-center justify-center rounded-md border bg-white font-semibold text-gray-500">
        {stock.isLoading && "Loading.."}
        {stock.isError && "-"}
        {stock.data && stock.data.success !== 1 && `${stock.data.message}`}
        {stock.data &&
          stock.data.success === 1 &&
          `${stock.data.amount.toLocaleString()} AMOUNT`}
      </div>
      <button
        onClick={handleBuySms}
        disabled={
          !!!selectService ||
          !!!selectedCountry ||
          loading ||
          stock.data?.success !== 1
        }
        className="border-md bg- h-10 w-96 rounded-md bg-gradient-to-r
       from-neutral-300 to-stone-400 text-white transition hover:from-neutral-400 hover:to-stone-600 active:scale-105"
      >
        {loading ? "Loading.." : "BUY"}
      </button>
    </div>
  );
}

export default SelectService;
