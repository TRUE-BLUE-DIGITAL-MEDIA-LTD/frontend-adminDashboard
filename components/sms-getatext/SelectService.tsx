import { UseQueryResult } from "@tanstack/react-query";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useState } from "react";
import Swal from "sweetalert2";
import { ErrorMessages, GetatextPrice } from "../../models";
import {
  useBuySmsGetatextNumber,
  useGetSmsGetatextPrices,
} from "../../react-query/sms-getatext";

type Props = {
  activeNumbers: UseQueryResult<any, Error>;
};
import { Service, services } from "../../data/services";

function SelectService({ activeNumbers }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const buy = useBuySmsGetatextNumber();

  const [selectedService, setSelectedService] = useState<GetatextPrice | null>(
    null,
  );

  // Fetch prices
  const pricesQuery = useGetSmsGetatextPrices();

  const serviceOptionTemplate = (option: GetatextPrice) => {
    return (
      <div className="flex w-full justify-between gap-2">
        <span>{option.service_name}</span>
        <span>${option.price} $</span>
        <span>stock: {option.stock > 0 ? option.stock : "Out of Stock"}</span>
      </div>
    );
  };

  const handleBuySms = async () => {
    try {
      if (!selectedService) return;
      if (!selectedService.api_name) return;
      setLoading(true);

      await buy.mutateAsync({
        service: selectedService.api_name,
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
        text: result.message?.toString() || "Unknown error",
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
        value={selectedService}
        onChange={(e: DropdownChangeEvent) => {
          setSelectedService(e.value);
        }}
        filter
        options={pricesQuery.data?.prices || []}
        optionLabel="service_name"
        placeholder="Select a Service"
        className="w-96 border"
        itemTemplate={serviceOptionTemplate}
      />

      <button
        onClick={handleBuySms}
        disabled={!selectedService || loading}
        className="border-md bg- h-10 w-96 rounded-md bg-gradient-to-r
        from-neutral-300 to-stone-400 text-white transition hover:from-neutral-400 hover:to-stone-600 active:scale-105"
      >
        {loading ? "Loading.." : "BUY"}
      </button>
    </div>
  );
}

export default SelectService;
