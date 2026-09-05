import Image from "next/image";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { SmsVirtualsms } from "../../models";
import { flagUrl } from "./SelectService";

const CANCEL_HOLD_MS = 2 * 60 * 1000;

type Props = {
  sms: SmsVirtualsms;
  onCancel: (id: string) => void;
};

function ActiveNumber({ sms, onCancel }: Props) {
  const [hidden, setHidden] = useState(false);
  const cancelAt = new Date(sms.createAt).getTime() + CANCEL_HOLD_MS;
  const [holdLeft, setHoldLeft] = useState(
    Math.max(0, Math.ceil((cancelAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (holdLeft <= 0) return;
    const t = setInterval(() => {
      setHoldLeft(Math.max(0, Math.ceil((cancelAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, [cancelAt, holdLeft]);

  return (
    <div className="w-full rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      {!hidden && (
        <div className="flex justify-between border-b border-gray-400 pb-2">
          <div className="flex items-center justify-start gap-2">
            <div className="relative h-5 w-7 overflow-hidden">
              <Image
                src={flagUrl(sms.country)}
                alt="country flag"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold">{sms.phoneNumber}</h3>
          </div>
          <div className="flex items-center justify-start gap-2">
            <h3 className="flex h-8 w-16 items-center justify-center rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
              <Countdown
                date={new Date(sms.expireAt)}
                renderer={({ minutes, seconds }) => (
                  <span>
                    {minutes}:{String(seconds).padStart(2, "0")}
                  </span>
                )}
              />
            </h3>
            <button
              onClick={() => onCancel(sms.id)}
              disabled={holdLeft > 0 || sms.isGetSms}
              title={
                holdLeft > 0
                  ? `Cancel available in ${holdLeft}s`
                  : "Cancel and refund"
              }
              className="flex h-8 w-20 items-center justify-center rounded-sm bg-red-300 p-1 px-2 text-xs text-red-700 disabled:bg-gray-200 disabled:text-gray-500"
            >
              {holdLeft > 0 ? `wait ${holdLeft}s` : "refund"}
            </button>
          </div>
        </div>
      )}
      {!hidden && (
        <div className="mt-2 flex w-full justify-start gap-2">
          <span>
            {sms.serviceCode} / {sms.country} : (${sms.price.toFixed(2)})
          </span>
        </div>
      )}
      {!hidden && (
        <div className="py-2">
          {sms.message ? (
            <ul className="max-h-40 overflow-auto">
              <li className="flex w-full flex-col gap-1 py-2">
                <span>SMS</span>
                <span>Message: {sms.message}</span>
              </li>
            </ul>
          ) : (
            <p>
              An SMS with a code will appear here after you use the number to
              receive SMS
            </p>
          )}
        </div>
      )}
      <div className="flex h-5 w-full justify-end">
        <button
          onClick={() => setHidden((prev) => !prev)}
          className="flex items-center justify-center gap-2 rounded-lg border p-1 px-2 hover:bg-gray-800 hover:text-white"
        >
          {hidden ? (
            <>
              <IoMdEye /> show
            </>
          ) : (
            <>
              <IoMdEyeOff /> hide
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ActiveNumber;
