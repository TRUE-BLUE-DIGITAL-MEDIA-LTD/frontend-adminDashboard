import Image from "next/image";
import Countdown from "react-countdown";
import { services } from "../../data/services";
import { Sms, SmsTextVerified } from "../../models";

type Props = {
  smsTextverified: SmsTextVerified;
  sms: Sms[];
  onOpen: (smsTextverified: SmsTextVerified) => void;
};
function ActiceNumber({ smsTextverified, sms, onOpen }: Props) {
  return (
    <div className=" w-full rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      <div className="flex justify-between border-b border-gray-400 pb-2">
        <div className="flex items-center justify-start gap-2">
          <div className="relative h-5 w-7 overflow-hidden ">
            <Image
              src={`/image/flags/1x1/${smsTextverified.country}.svg`}
              alt="country flag"
              fill
              className="object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold">
            {smsTextverified.phoneNumber}
          </h3>

          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => onOpen(smsTextverified)}
              className="flex h-8 w-16 items-center justify-center rounded-sm  bg-green-300 p-1 px-3 text-green-700 hover:scale-105 active:scale-110"
            >
              open
            </button>
          </div>
        </div>
        <div className="flex items-center justify-start gap-2">
          <h3 className="rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
            <Countdown
              date={new Date(smsTextverified.expireAt)}
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
      <div className="mt-2 flex w-full justify-start gap-2">
        <div className="relative h-5 w-7 overflow-hidden ">
          <Image
            src={
              services.find(
                (service) => service.slug === smsTextverified.serviceCode,
              )?.icon as string
            }
            alt="Service Icon"
            fill
            className="object-contain"
          />
        </div>
        <span>
          {
            services.find(
              (service) => service.slug === smsTextverified.serviceCode,
            )?.title as string
          }
        </span>
        <span>{smsTextverified.price} $</span>
      </div>
      <div className="py-2">
        {sms?.length > 0 ? (
          <ul className="flex max-h-40 flex-col overflow-auto">
            {sms.map((s) => {
              return (
                <li key={s.id} className="flex w-full flex-col gap-1 py-2 ">
                  <span>{s.parsedCode}</span>
                  <span>Message: {s.smsContent}</span>
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
    </div>
  );
}

export default ActiceNumber;
