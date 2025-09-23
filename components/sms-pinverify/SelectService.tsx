import { UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import {
  Dropdown,
  DropdownChangeEvent,
  DropdownProps,
} from "primereact/dropdown";
import { useState } from "react";
import Swal from "sweetalert2";
import { countries } from "../../data/country";
import { ErrorMessages } from "../../models";
import {
  useCreateSmsPinverify,
  useGetSmsPinverifyServiceList,
} from "../../react-query";
import { useGetServiceSMSPool } from "../../react-query/sms-pool";
import { ResponseGetSMSPinverifyService } from "../../services/sms-pinverify";

type Props = {
  activeNumbers: UseQueryResult<ResponseGetSMSPinverifyService, Error>;
};

type Country = {
  flag: string;
  country: string;
  code: string;
  countryCode: string;
};
type Service = {
  app: string;
  business_code: string;
  rate: string;
};
function SelectService({ activeNumbers }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const buy = useCreateSmsPinverify();
  const [selectedCountry, setSelectedCountry] = useState<
    Country & { sms_pinverify: string }
  >({
    flag: "https://flagicons.lipis.dev/flags/4x3/um.svg",
    country: "United States",
    code: "us",
    sms_pinverify: "USA",
    countryCode: "+1",
  });
  const service = useGetSmsPinverifyServiceList({
    country: selectedCountry.sms_pinverify,
  });

  const [selectService, setSelectService] = useState<{
    app: string;
    business_code: string;
    rate: string;
  } | null>(null);

  const panelFooterTemplate = () => {
    return (
      <div className="px-3 py-2">
        {selectedCountry ? (
          <span>
            <b>{selectedCountry.country}</b> selected.
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
          <Image src={option.flag} fill alt="flag" className="object-contain" />
        </div>
        <div>{option.country}</div>
      </div>
    );
  };

  const serviceOptionTemplate = (option: Service) => {
    return (
      <div className="align-items-center flex w-96 gap-2">
        <div>{option.app}</div>
      </div>
    );
  };

  const selectedCountryTemplate = (option: Country, props: DropdownProps) => {
    if (option) {
      return (
        <div className="align-items-center flex gap-2">
          <div className="relative h-5 w-5 overflow-hidden">
            <Image
              src={option.flag}
              fill
              alt="flag"
              className="object-contain"
            />
          </div>
          <div>{option.country}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const handleBuySms = async () => {
    try {
      setLoading(true);
      await buy.mutateAsync({
        service: selectService?.business_code as string,
        country: selectedCountry?.sms_pinverify as string,
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
        options={countries.filter((a) => a.sms_pinverify)}
        optionLabel="country"
        placeholder="Select a Country"
        valueTemplate={selectedCountryTemplate}
        itemTemplate={countryOptionTemplate}
        className="w-96 border"
        panelFooterTemplate={panelFooterTemplate}
      />

      <Dropdown
        value={selectService}
        onChange={(e: DropdownChangeEvent) => setSelectService(e.value)}
        filter
        options={service.data}
        loading={service.isLoading}
        optionLabel="business_code"
        placeholder="Select a Service"
        className="w-96 border"
        itemTemplate={serviceOptionTemplate}
      />

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
