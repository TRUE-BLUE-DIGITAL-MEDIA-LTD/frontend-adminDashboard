import Image from "next/image";
import { useState } from "react";
import Countdown from "react-countdown";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { countries } from "../../data/country";
import { SmsDaisy, SmsDaisyMessage } from "../../models";
import { services } from "../../data/services";

type Props = {
  smsDaisy: SmsDaisy & { messages: SmsDaisyMessage[] };
  onCancel: (smsPvaId: string) => void;
};
function ActiceNumber({ smsDaisy, onCancel }: Props) {
  const [triggerHide, setTriggerHide] = useState(false);
  const country = countries.find((c) => c.sms_daisy === smsDaisy.country);
  const service = services.find((s) => s.sms_daisy === smsDaisy.serviceCode);
  return (
    <div className=" w-full rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      {triggerHide === false && (
        <div className="flex justify-between border-b border-gray-400 pb-2">
          <div className="flex items-center justify-start gap-2">
            <div className="relative h-5 w-7 overflow-hidden ">
              <Image
                src={country?.flag ?? ""}
                alt="country flag"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold">
              {country?.countryCode} {smsDaisy.phoneNumber}
            </h3>
          </div>
          <div className="flex items-center justify-start gap-2">
            <h3 className="flex h-8 w-16 items-center justify-center rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
              <Countdown
                date={new Date(smsDaisy.expireAt)}
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
                onClick={() => onCancel(smsDaisy.id)}
                className="flex h-8 w-16 items-center justify-center rounded-sm bg-red-300 p-1 px-3 text-red-700"
              >
                refund
              </button>
            </div>
          </div>
        </div>
      )}
      {triggerHide === false && (
        <div className="mt-2 flex w-full justify-start gap-2">
          <span>
            {service?.title} : ({smsDaisy.price}$)
          </span>
        </div>
      )}
      {triggerHide === false && (
        <div className="py-2">
          {smsDaisy.messages.length > 0 ? (
            <ul className="flex max-h-40 flex-col overflow-auto">
              {smsDaisy.messages.map((sms) => {
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

export default ActiceNumber;
