import { UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useState } from "react";
import Swal from "sweetalert2";
import { ErrorMessages, SmsBulkCountryItem, SmsBulkServiceItem } from "../../models";
import {
  useCreateSmsBulk,
  useGetSmsBulkCountryList,
  useGetSmsBulkServiceList,
} from "../../react-query";
import { ResponseGetSmsBulkService } from "../../services/sms-bulk";

type Props = { activeNumbers: UseQueryResult<ResponseGetSmsBulkService, Error> };

export function flagUrl(iso2: string) {
  return `https://flagicons.lipis.dev/flags/4x3/${iso2.toLowerCase()}.svg`;
}

function SelectService({ activeNumbers }: Props) {
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState<SmsBulkServiceItem | null>(null);
  const [country, setCountry] = useState<SmsBulkCountryItem | null>(null);
  const buy = useCreateSmsBulk();
  const services = useGetSmsBulkServiceList();
  const countries = useGetSmsBulkCountryList({ service: service?.code ?? "" });

  const serviceTemplate = (option: SmsBulkServiceItem) => (
    <div className="flex w-96 justify-between gap-2">
      <span>{option.name}</span>
      <span className="text-gray-500">
        {option.code}
        {option.minPrice ? ` · from $${Number(option.minPrice).toFixed(2)}` : ""}
      </span>
    </div>
  );

  const countryTemplate = (option: SmsBulkCountryItem) => (
    <div className="flex w-96 items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="relative h-5 w-5 overflow-hidden">
          <Image src={flagUrl(option.isoCode)} fill alt="flag" className="object-contain" />
        </div>
        <span>{option.name}</span>
        <span className="text-xs text-gray-400">
          {option.stock} in stock{option.speedTier ? ` · ${option.speedTier}` : ""}
        </span>
      </div>
      <span className="font-semibold">${Number(option.price).toFixed(2)}</span>
    </div>
  );

  const handleBuy = async () => {
    if (!service || !country) return;
    try {
      setLoading(true);
      await buy.mutateAsync({ service: service.code, country: country.isoCode });
      await activeNumbers.refetch();
      Swal.fire({ title: "Success", text: "Number has been reserved.", icon: "success" });
    } catch (error) {
      const result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result.message?.toString(),
        footer: result.statusCode ? "Error code: " + result.statusCode : "",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-gray-100 p-5 font-Poppins">
      <Dropdown
        value={service}
        onChange={(e: DropdownChangeEvent) => {
          setService(e.value);
          setCountry(null);
        }}
        filter
        options={services.data ?? []}
        loading={services.isLoading}
        optionLabel="name"
        dataKey="code"
        placeholder="Select a Service"
        className="w-96 border"
        itemTemplate={serviceTemplate}
      />
      <Dropdown
        value={country}
        onChange={(e: DropdownChangeEvent) => setCountry(e.value)}
        filter
        disabled={!service}
        options={(countries.data ?? []).filter((c) => c.stock > 0)}
        loading={countries.isLoading}
        optionLabel="name"
        dataKey="isoCode"
        placeholder={service ? "Select a Country" : "Select a service first"}
        className="w-96 border"
        itemTemplate={countryTemplate}
      />
      <div className="flex h-6 w-96 items-center justify-end text-sm text-gray-600">
        {country ? `Price: $${Number(country.price).toFixed(2)}` : ""}
      </div>
      <button
        onClick={handleBuy}
        disabled={!service || !country || loading}
        className="h-10 w-96 rounded-md bg-gradient-to-r from-neutral-300 to-stone-400 text-white transition hover:from-neutral-400 hover:to-stone-600 active:scale-105 disabled:opacity-50"
      >
        {loading ? "Loading.." : "BUY"}
      </button>
    </div>
  );
}

export default SelectService;
