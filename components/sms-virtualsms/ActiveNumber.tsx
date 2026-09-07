import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { SmsVirtualsms, SmsVirtualsmsMessage } from "../../models";
import { flagUrl } from "./SelectService";

const CANCEL_HOLD_MS = 2 * 60 * 1000;

type Props = {
  sms: SmsVirtualsms;
  onCancel: (id: string) => void;
  onDone: (id: string) => void;
};

function ActiveNumber({ sms, onCancel, onDone }: Props) {
  const [hidden, setHidden] = useState(false);
  const cancelAt = new Date(sms.createAt).getTime() + CANCEL_HOLD_MS;
  const [holdLeft, setHoldLeft] = useState(
    Math.max(0, Math.ceil((cancelAt - Date.now()) / 1000)),
  );
  const messages: SmsVirtualsmsMessage[] = sms.messages ?? [];

  useEffect(() => {
    if (holdLeft <= 0) return;
    const t = setInterval(() => {
      setHoldLeft(Math.max(0, Math.ceil((cancelAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, [cancelAt, holdLeft]);

  return (
    <div className="w-full overflow-hidden rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      {!hidden && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-400 pb-2">
          <div className="flex min-w-0 items-center justify-start gap-2">
            <div className="relative h-5 w-7 shrink-0 overflow-hidden">
              <Image
                src={flagUrl(sms.country)}
                alt="country flag"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="truncate text-lg font-semibold">{sms.phoneNumber}</h3>
          </div>
          <div className="flex shrink-0 items-center justify-start gap-2">
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
            {sms.isGetSms ? (
              <button
                onClick={() => onDone(sms.id)}
                title="Mark as done and move to history"
                className="flex h-8 w-20 items-center justify-center rounded-sm bg-green-600 p-1 px-2 text-xs font-semibold text-white hover:bg-green-700"
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => onCancel(sms.id)}
                disabled={holdLeft > 0}
                title={
                  holdLeft > 0
                    ? `Cancel available in ${holdLeft}s`
                    : "Cancel and refund"
                }
                className="flex h-8 w-20 items-center justify-center rounded-sm bg-red-300 p-1 px-2 text-xs text-red-700 disabled:bg-gray-200 disabled:text-gray-500"
              >
                {holdLeft > 0 ? `wait ${holdLeft}s` : "refund"}
              </button>
            )}
          </div>
        </div>
      )}
      {!hidden && (
        <div className="mt-2 flex w-full justify-start gap-2 text-sm">
          <span className="truncate">
            {sms.serviceCode} / {sms.country} : (${sms.price.toFixed(2)})
          </span>
        </div>
      )}
      {!hidden && (
        <div className="py-2">
          {messages.length > 0 ? (
            <>
              <ul className="flex max-h-40 flex-col gap-2 overflow-auto">
                {messages.map((m, i) => (
                  <li
                    key={`${m.receivedAt}-${i}`}
                    className="flex w-full flex-col gap-1 rounded-sm bg-gray-50 p-2"
                  >
                    <span className="text-xs text-gray-500">
                      SMS {i + 1}
                      {m.sender ? ` · ${m.sender}` : ""} ·{" "}
                      {moment(m.receivedAt).format("HH:mm:ss")}
                    </span>
                    <span className="break-words text-sm">{m.content}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-500">
                Still listening for more SMS until the timer ends. Press Done
                when you have what you need.
              </p>
            </>
          ) : (
            <p className="text-sm">
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
