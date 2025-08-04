import Image from "next/image";
import { useEffect } from "react";
import {
  MdCancel,
  MdCheckBox,
  MdOutlineRecycling,
  MdReport,
} from "react-icons/md";
import Swal from "sweetalert2";
import { services } from "../../data/services";
import { SmsTextVerified } from "../../models";
import {
  useCancelTextVerified,
  useGetTextVerifiedId,
  useReactiveTextVerified,
  useReportTextVerified,
  useReusedTextVerified,
} from "../../react-query";
import SpinLoading from "../loadings/spinLoading";

type Props = {
  textverified: SmsTextVerified;
};
function SelectNumber({ textverified }: Props) {
  const sms_textverified = useGetTextVerifiedId({
    smsTextVerifiedId: textverified.id,
  });
  useEffect(() => {
    sms_textverified.refetch();
  }, []);
  const cancel = useCancelTextVerified();
  const report = useReportTextVerified();
  const reactive = useReactiveTextVerified();
  const resued = useReusedTextVerified();

  const handleCancel = async (id: string) => {
    try {
      await cancel.mutateAsync({
        smsTextVerifiedId: id,
      });
      Swal.fire({
        title: "Success",
        text: "Operation has been successfully completed.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as { errorDescription: string; errorCode: string };
      Swal.fire({
        title: result.errorCode ? result.errorCode : "Something went wrong!",
        text: result?.errorDescription,
        icon: "error",
      });
    }
  };

  const handleReport = async (id: string) => {
    try {
      await report.mutateAsync({
        smsTextVerifiedId: id,
      });
      Swal.fire({
        title: "Success",
        text: "Operation has been successfully completed.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as { errorDescription: string; errorCode: string };
      Swal.fire({
        title: result.errorCode ? result.errorCode : "Something went wrong!",
        text: result?.errorDescription,
        icon: "error",
      });
    }
  };

  const handleReactive = async (id: string) => {
    try {
      await reactive.mutateAsync({
        smsTextVerifiedId: id,
      });
      Swal.fire({
        title: "Success",
        text: "Operation has been successfully completed.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as { errorDescription: string; errorCode: string };
      Swal.fire({
        title: result.errorCode ? result.errorCode : "Something went wrong!",
        text: result?.errorDescription,
        icon: "error",
      });
    }
  };

  const handleReused = async (id: string) => {
    try {
      await resued.mutateAsync({
        smsTextVerifiedId: id,
      });
      Swal.fire({
        title: "Success",
        text: "Operation has been successfully completed.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as { errorDescription: string; errorCode: string };
      Swal.fire({
        title: result.errorCode ? result.errorCode : "Something went wrong!",
        text: result?.errorDescription,
        icon: "error",
      });
    }
  };

  return (
    <div className="flex h-max w-96 flex-col gap-2 rounded-xl bg-white p-3">
      <header className="flex items-center justify-between">
        {cancel.isPending ||
        report.isPending ||
        reactive.isPending ||
        resued.isPending ? (
          <SpinLoading />
        ) : (
          <div className="mt-2 flex w-full items-center justify-start gap-2">
            <div className="relative h-10 w-10 overflow-hidden ">
              <Image
                src={
                  services.find(
                    (service) => service.slug === textverified.serviceCode,
                  )?.icon as string
                }
                alt="Service Icon"
                fill
                className="object-contain"
              />
            </div>
            <span className="tex-xl font-semibold">
              {
                services.find(
                  (service) => service.slug === textverified.serviceCode,
                )?.title as string
              }
            </span>
          </div>
        )}

        <div className="flex h-7 items-center justify-center rounded-lg bg-green-200 px-3 text-green-800">
          {sms_textverified.data?.detail.state}
        </div>
      </header>

      <main className="flex flex-col gap-3">
        <div className="flex h-10 w-full items-center justify-center rounded-md border bg-white font-semibold text-gray-500">
          Phone number {textverified.phoneNumber}
        </div>
        <div className="flex w-full justify-between gap-3">
          <div
            className="flex h-10 w-full items-center justify-center 
          rounded-md border bg-white font-semibold text-gray-500"
          >
            {textverified.price} $
          </div>
          <div
            className="flex h-10 w-full items-center justify-center 
          rounded-md border bg-white font-semibold text-gray-500"
          >
            <div className="relative h-5 w-7 overflow-hidden ">
              <Image
                src={`/image/flags/1x1/${textverified.country}.svg`}
                alt="country flag"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        {sms_textverified.data && (
          <section className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCancel(textverified.id)}
              disabled={!sms_textverified.data.detail.cancel.canCancel}
              className="flex h-10 w-full items-center justify-center gap-1 rounded-lg
           bg-red-500 text-white hover:bg-red-600 active:scale-110 disabled:bg-gray-600"
            >
              <MdCancel /> Cancel
            </button>
            <button
              onClick={() => handleReport(textverified.id)}
              disabled={!sms_textverified.data.detail.report.canReport}
              className="flex h-10 w-full items-center justify-center gap-1 rounded-lg
           bg-orange-500 text-white hover:bg-orange-600 active:scale-110 disabled:bg-gray-600"
            >
              <MdReport /> Report
            </button>
            <button
              onClick={() => handleReactive(textverified.id)}
              disabled={!sms_textverified.data.detail.reactivate.canReactivate}
              className="flex h-10 w-full items-center justify-center gap-1 rounded-lg
           bg-green-500 text-white hover:bg-green-600 active:scale-110 disabled:bg-gray-600"
            >
              <MdCheckBox />
              Reactive
            </button>
            <button
              onClick={() => handleReused(textverified.id)}
              disabled={
                sms_textverified.data.detail.reuse.reusableUntil === null
                  ? true
                  : new Date(
                        sms_textverified.data.detail.reuse.reusableUntil,
                      ).getTime() > new Date().getTime()
                    ? false
                    : true
              }
              className="flex h-10 w-full items-center justify-center gap-1 rounded-lg
           bg-green-500 text-white hover:bg-green-600 active:scale-110 disabled:bg-gray-600"
            >
              <MdOutlineRecycling />
              Reused
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default SelectNumber;
