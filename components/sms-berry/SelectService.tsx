import { UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";
import Swal from "sweetalert2";
import { ErrorMessages } from "../../models";
import { useCreateSmsBerry } from "../../react-query/sms-berry";
import { ResponseGetActiveSmsBerryNumbersService } from "../../services/sms-berry";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Service, services } from "../../data/services";

type Props = {
  activeNumbers: UseQueryResult<
    ResponseGetActiveSmsBerryNumbersService,
    ErrorMessages
  >;
};

function SelectService({ activeNumbers }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const buy = useCreateSmsBerry();

  const [selectService, setSelectService] = useState<Service | null>(null);

  const handleBuySms = async () => {
    try {
      if (!selectService || !selectService.sms_berry) {
        Swal.fire(
          "Error",
          "Please provide Application ID and Rate Plan",
          "error",
        );
        return;
      }
      setLoading(true);

      await buy.mutateAsync({
        applications: [selectService.sms_berry],
        ratePlan: 11,
        requestedNumberOfSim: 1,
        autoRenew: false,
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
      const result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result.message?.toString() || "Unknown error occurred",
        footer: result.statusCode
          ? "Error code: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  const serviceOptionTemplate = (option: Service) => {
    return (
      <div className="align-items-center flex w-96 gap-2">
        <div>{option.title}</div>
      </div>
    );
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-gray-100 p-5 font-Poppins">
      <h3 className="border-b pb-2 text-lg font-semibold">Order New Number</h3>
      <Dropdown
        value={selectService}
        onChange={(e: DropdownChangeEvent) => setSelectService(e.value)}
        filter
        options={services.filter((s) => s.sms_berry)}
        optionLabel="title"
        placeholder="Select a Service"
        className="w-96 border"
        itemTemplate={serviceOptionTemplate}
      />

      <button
        onClick={handleBuySms}
        disabled={!selectService || loading}
        className="border-md mt-4 h-10 w-full rounded-md bg-gradient-to-r
        from-neutral-300 to-stone-400 text-white transition hover:from-neutral-400 hover:to-stone-600 active:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Loading.." : "BUY"}
      </button>
    </div>
  );
}

export default SelectService;
