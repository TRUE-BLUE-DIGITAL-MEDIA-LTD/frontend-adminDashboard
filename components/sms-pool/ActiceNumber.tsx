import Image from "next/image";
import Countdown from "react-countdown";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Swal from "sweetalert2";
import { ErrorMessages, SMSPool } from "../../models";
import {
  useGetCountrySMSPool,
  useResendSMSPool,
} from "../../react-query/sms-pool";
import { useState } from "react";

type Props = {
  smsPool: SMSPool;
  sms?: {
    code?: string;
    fullText?: string;
    status: string;
  };
  onCancel: (smsPvaId: string) => void;
  onBlock: (smsPvaId: string) => void;
};
function ActiceNumber({ smsPool, sms, onBlock, onCancel }: Props) {
  const countries = useGetCountrySMSPool();
  const resend = useResendSMSPool();
  const country = countries.data?.find((c) => c.name === smsPool.country);
  const [triggerHide, setTriggerHide] = useState(false);

  const handleResend = async () => {
    try {
      await resend.mutateAsync({
        id: smsPool.id,
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Error code: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  return (
    <div className=" w-full rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      {triggerHide === false && (
        <div className="flex justify-between border-b border-gray-400 pb-2">
          <div className="flex items-center justify-start gap-2">
            <div className="relative h-5 w-7 overflow-hidden ">
              <Image
                src={`/image/flags/1x1/${country?.short_name}.svg`}
                alt="country flag"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold">{smsPool.phoneNumber}</h3>
          </div>
          <div className="flex items-center justify-start gap-2">
            <h3 className="flex h-8 w-16 items-center justify-center rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
              <Countdown
                date={new Date(smsPool.expireAt)}
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
              <button
                onClick={() => onCancel(smsPool.id)}
                className="flex h-8 w-16 items-center justify-center rounded-sm bg-red-300 p-1 px-3 text-red-700"
              >
                refund
              </button>
              <button
                disabled={resend.isPending}
                onClick={handleResend}
                className="flex h-8 w-16 items-center justify-center rounded-sm bg-green-300 p-1 px-3 text-green-700"
              >
                <>{resend.isPending ? "Loading.." : "Resend"}</>
              </button>
            </div>
          </div>
        </div>
      )}
      {triggerHide === false && (
        <div className="mt-2 flex w-full justify-start gap-2">
          <span>
            {smsPool.serviceCode} : ({smsPool.price}$)
          </span>
        </div>
      )}
      {triggerHide === false && (
        <div className="py-2">
          {sms?.code || sms?.fullText ? (
            <ul className="max-h-40 overflow-auto">
              <li className="flex w-full flex-col gap-1 py-2 ">
                <span>{sms.code}</span>
                <span>Message: {sms.fullText}</span>
              </li>
            </ul>
          ) : (
            <p>
              An SMS with a code will appear here after you use the number to
              receive SMS ({sms?.status})
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

export default ActiceNumber;
