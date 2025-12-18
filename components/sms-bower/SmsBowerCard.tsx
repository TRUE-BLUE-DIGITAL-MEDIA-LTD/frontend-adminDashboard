import Image from "next/image";
import { useState } from "react";
import Countdown from "react-countdown";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdReport } from "react-icons/md";
import Swal from "sweetalert2";
import { countries } from "../../data/country";
import { services } from "../../data/services";
import { ErrorMessages, SmsBower, SmsBowerMessage } from "../../models";
import {
  useReportSmsBower,
  useRequestAnotherCodeSmsBower,
} from "../../react-query/sms-bower";

type Props = {
  smsBower: SmsBower & { messages: SmsBowerMessage[] };
  onCancel: (id: string) => void;
};

function SmsBowerCard({ smsBower, onCancel }: Props) {
  const report = useReportSmsBower();
  const requestAnotherCode = useRequestAnotherCodeSmsBower();
  const [triggerHide, setTriggerHide] = useState(false);
  const country = countries.find((c) => c.sms_bower === smsBower.country);
  const service = services.find((s) => s.sms_bower === smsBower.serviceCode);

  const handleRequestAnotherCode = async () => {
    try {
      await requestAnotherCode.mutateAsync({
        id: smsBower.id,
      });
      Swal.fire({
        title: "Success",
        text: "Request another code successfully.",
        icon: "success",
      });
    } catch (error) {
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

  const handleReportSms = async () => {
    try {
      const result = await Swal.fire({
        title: "Report Number",
        text: "Are you sure you want to cancel this number?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, cancel it!",
      });

      if (result.isConfirmed) {
        await report.mutateAsync({
          id: smsBower.id,
        });
        Swal.fire({
          title: "Success",
          text: "Number has been canceled successfully.",
          icon: "success",
        });
      }
    } catch (error) {
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
    <div className=" w-full rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      {triggerHide === false && (
        <div className="flex flex-col  gap-2 ">
          <div className="flex  items-center justify-start gap-2 border-b border-gray-400 pb-2">
            <div className="relative h-5 w-7 overflow-hidden ">
              <Image
                src={country?.flag ?? ""}
                alt="country flag"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold">
              {country?.countryCode} {smsBower.phoneNumber}
            </h3>
          </div>
          <div className="flex w-full items-center justify-end gap-2">
            <h3 className="flex h-8 w-16 items-center justify-center rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
              <Countdown
                date={new Date(smsBower.expireAt)}
                intervalDelay={0}
                precision={3}
                onComplete={() => {}}
                renderer={({ hours, minutes, seconds }) => {
                  return (
                    <span>
                      {minutes}:{seconds}
                    </span>
                  );
                }}
              />
            </h3>

            <div className="flex items-center justify-center gap-1">
              {smsBower.messages.length > 0 && (
                <button
                  disabled={requestAnotherCode.isPending}
                  onClick={handleRequestAnotherCode}
                  className="flex h-8 items-center justify-center rounded-sm bg-blue-300 p-1 px-3 text-blue-700 disabled:bg-blue-200"
                >
                  {requestAnotherCode.isPending ? "Loading..." : "Next SMS"}
                </button>
              )}
              <button
                onClick={handleReportSms}
                className="flex h-8 w-16 items-center justify-center rounded-sm bg-red-300 p-1 px-3 text-red-700"
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {triggerHide === false && (
        <div className="mt-2 flex w-full justify-start gap-2">
          <span>
            {service?.title || smsBower.serviceCode} : ({smsBower.price}$)
          </span>
        </div>
      )}
      {triggerHide === false && (
        <div className="py-2">
          {smsBower.messages.length > 0 ? (
            <ul className="flex max-h-40 flex-col overflow-auto">
              {smsBower.messages.map((sms) => {
                return (
                  <li key={sms.id} className="flex w-full flex-col gap-1 py-2 ">
                    <span>SMS: {sms.code}</span>
                    <span>Message: {sms.text}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>
              An SMS with a code will appear here after you use the number to
              receive SMS
            </p>
          )}
        </div>
      )}
      <div className="flex h-5 w-full justify-end ">
        <button
          onClick={() => setTriggerHide((prev) => !prev)}
          className="flex items-center justify-center gap-2 rounded-lg border p-1 px-2 hover:bg-gray-800 hover:text-white"
        >
          {triggerHide === false ? (
            <>
              <IoMdEyeOff /> hide
            </>
          ) : (
            <>
              <IoMdEye /> show
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default SmsBowerCard;
