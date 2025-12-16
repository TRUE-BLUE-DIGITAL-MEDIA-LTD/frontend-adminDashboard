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
import { Service, services } from "../../data/services";
import { ErrorMessages, FlatPrice } from "../../models";
import {
  useCreateSmsBower,
  useGetSmsBowerPrices,
} from "../../react-query/sms-bower";
import { ResponseGetActiveSmsBowerNumbersService } from "../../services/sms-bower";

type Props = {
  activeNumbers: UseQueryResult<ResponseGetActiveSmsBowerNumbersService, Error>;
};

type Country = {
  flag: string;
  country: string;
  code: string;
  countryCode: string;
  sms_bower?: string;
};

function SelectService({ activeNumbers }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const buy = useCreateSmsBower();

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectService, setSelectService] = useState<Service | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<FlatPrice | null>(null);

  // Fetch prices
  const pricesQuery = useGetSmsBowerPrices({
    country: selectedCountry?.sms_bower || "",
    service: selectService?.sms_bower || "",
  });

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
        <div>{option.title}</div>
      </div>
    );
  };

  const priceOptionTemplate = (option: FlatPrice) => {
    return (
      <div className="flex w-full justify-between gap-2">
        <span>{option.providerKey}</span>
        <span>
          Price: ${option.price} | Count: {option.count}
        </span>
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
      if (!selectedPrice) return;
      setLoading(true);

      await buy.mutateAsync({
        service: selectService?.sms_bower as string,
        country: selectedCountry?.sms_bower as string,
        providerId: selectedPrice.provider_id,
      });
      await activeNumbers.refetch();
      Swal.fire({
        title: "Success",
        text: "Number has been successfully created.",
        icon: "success",
      });
      setLoading(false);
      setSelectedPrice(null);
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
        onChange={(e: DropdownChangeEvent) => {
          setSelectedCountry(e.value);
          setSelectedPrice(null);
        }}
        options={countries.filter((a) => a.sms_bower)}
        optionLabel="country"
        placeholder="Select a Country"
        valueTemplate={selectedCountryTemplate}
        itemTemplate={countryOptionTemplate}
        className="w-96 border"
        panelFooterTemplate={panelFooterTemplate}
      />

      <Dropdown
        value={selectService}
        onChange={(e: DropdownChangeEvent) => {
          setSelectService(e.value);
          setSelectedPrice(null);
        }}
        filter
        options={services.filter((s) => s.sms_bower)}
        optionLabel="title"
        placeholder="Select a Service"
        className="w-96 border"
        itemTemplate={serviceOptionTemplate}
      />

      <Dropdown
        value={selectedPrice}
        onChange={(e: DropdownChangeEvent) => setSelectedPrice(e.value)}
        options={pricesQuery.data || []}
        optionLabel="providerKey"
        placeholder={
          pricesQuery.isLoading ? "Loading providers..." : "Select Provider"
        }
        className="w-96 border"
        itemTemplate={priceOptionTemplate}
        disabled={!selectedCountry || !selectService || pricesQuery.isLoading}
        emptyMessage={
          pricesQuery.isError
            ? "Error loading prices"
            : "No providers available"
        }
      />

      <button
        onClick={handleBuySms}
        disabled={
          !!!selectService || !!!selectedCountry || !!!selectedPrice || loading
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
