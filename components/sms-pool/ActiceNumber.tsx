import Image from "next/image";
import Countdown from "react-countdown";
import { ErrorMessages, SMSPool } from "../../models";
import {
  useGetCountrySMSPool,
  useGetServiceSMSPool,
  useResendSMSPool,
} from "../../react-query/sms-pool";
import Swal from "sweetalert2";
import SpinLoading from "../loadings/spinLoading";

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
      <div className="mt-2 flex w-full justify-start gap-2">
        <span>{smsPool.serviceCode}</span>
      </div>
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
    </div>
  );
}

export default ActiceNumber;
