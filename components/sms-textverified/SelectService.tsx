import { UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import {
  Dropdown,
  DropdownChangeEvent,
  DropdownProps,
} from "primereact/dropdown";
import { useState } from "react";
import Swal from "sweetalert2";
import { Country, ErrorMessages, Service } from "../../models";
import {
  useCreateTextverified,
  useGetPriceOnVerifiedService,
  useGetTextverifiedService,
} from "../../react-query";
import { useCreateSMSPool } from "../../react-query/sms-pool";
import { ResponseGetTextVerifiedsService } from "../../services/sms-textverified";

type Props = {
  activeNumbers: UseQueryResult<ResponseGetTextVerifiedsService, Error>;
};
function SelectService({ activeNumbers }: Props) {
  const country = {
    data: [{ name: "USA", short_name: "us" }],
    isLoading: false,
  };
  const service = useGetTextverifiedService({
    numberType: "mobile",
    reservationType: "renewable",
  });
  const buy = useCreateTextverified();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<{
    name: "USA";
    short_name: "us";
  } | null>({
    name: "USA",
    short_name: "us",
  });
  const [selectService, setSelectService] = useState<{
    serviceName: string;
    capability: string;
  } | null>(null);

  const price = useGetPriceOnVerifiedService({
    areaCode: false,
    carrier: false,
    numberType: "mobile",
    capability: "sms",
    serviceName: selectService?.serviceName ?? "",
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

  const serviceOptionTemplate = (option: {
    serviceName: string;
    capability: string;
  }) => {
    return (
      <div className="align-items-center flex w-96 gap-2">
        <div>
          {option.serviceName} - ({option.capability})
        </div>
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
      if (!selectService) {
        return;
      }
      setLoading(true);
      await buy.mutateAsync({
        serviceName: selectService?.serviceName,
        capability: "sms",
      });
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
        text: result.message?.toString(),
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
        optionLabel="serviceName"
        placeholder="Select a Service"
        className="w-96 border"
        itemTemplate={serviceOptionTemplate}
        panelFooterTemplate={panelFooterTemplate}
      />

      <div className="flex h-10 w-96 items-center justify-center rounded-md border bg-white font-semibold text-gray-500">
        {price.isLoading
          ? "...Loading Price"
          : price.data
            ? `${price.data}$`
            : ""}
      </div>
      <button
        onClick={handleBuySms}
        disabled={!!!selectService || !!!selectedCountry || loading}
        className="border-md bg- h-10 w-96 rounded-md bg-gradient-to-r
       from-neutral-300 to-stone-400 text-white transition hover:from-neutral-400 hover:to-stone-600 active:scale-105"
      >
        {loading ? "Loading.." : "BUY"}
      </button>
    </div>
  );
}

export default SelectService;
