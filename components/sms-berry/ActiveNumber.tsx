import Image from "next/image";
import { useState } from "react";
import Countdown from "react-countdown";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { countries } from "../../data/country";
import { SmsBerry, SmsBerryMessage } from "../../models";
import { services } from "../../data/services";

type Props = {
  smsBerry: SmsBerry & { messages: SmsBerryMessage[] };
};

function ActiveNumber({ smsBerry }: Props) {
  const [triggerHide, setTriggerHide] = useState(false);
  const country = countries.find(
    (c) => c.code === smsBerry.country?.toLowerCase(),
  );
  const service = services.find((s) => s.code === smsBerry.serviceCode);

  return (
    <div className=" w-full rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      {triggerHide === false && (
        <div className="flex flex-col  gap-2 ">
          <div className="flex  items-center justify-start gap-2 border-b border-gray-400 pb-2">
            <div className="relative h-5 w-7 overflow-hidden ">
              {country?.flag && (
                <Image
                  src={country.flag}
                  alt="country flag"
                  fill
                  className="object-contain"
                />
              )}
            </div>
            <h3 className="text-lg font-semibold">
              {country?.countryCode} {smsBerry.phoneNumber}
            </h3>
          </div>
          <div className="flex w-full items-center justify-end gap-2">
            <h3 className="flex h-8 w-16 items-center justify-center rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
              <Countdown
                date={new Date(smsBerry.expireAt)}
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
          </div>
        </div>
      )}
      {triggerHide === false && (
        <div className="mt-2 flex w-full justify-start gap-2">
          <span>
            {service?.title || smsBerry.serviceCode} : (${smsBerry.price})
          </span>
        </div>
      )}
      {triggerHide === false && (
        <div className="py-2">
          {smsBerry.messages.length > 0 ? (
            <ul className="flex max-h-40 flex-col overflow-auto">
              {smsBerry.messages.map((sms) => {
                return (
                  <li key={sms.id} className="flex w-full flex-col gap-1 py-2 ">
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

export default ActiveNumber;
