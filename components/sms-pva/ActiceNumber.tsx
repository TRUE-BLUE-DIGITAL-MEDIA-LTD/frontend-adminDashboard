import React from "react";
import { SmsPva } from "../../models";
import Image from "next/image";
import Countdown from "react-countdown";
import { GiCancel } from "react-icons/gi";
import { services } from "../../data/services";

type Props = {
  smsPva: SmsPva;
  sms?: {
    code?: string;
    fullText?: string;
    status: string;
  };
  onCancel: (smsPvaId: string) => void;
  onBlock: (smsPvaId: string) => void;
};
function ActiceNumber({ smsPva, sms, onBlock, onCancel }: Props) {
  return (
    <div className=" w-full rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl">
      <div className="flex justify-between border-b border-gray-400 pb-2">
        <div className="flex items-center justify-start gap-2">
          <div className="relative h-5 w-7 overflow-hidden ">
            <Image
              src={`/image/flags/1x1/${smsPva.country}.svg`}
              alt="country flag"
              fill
              className="object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold">{smsPva.phoneNumber}</h3>
        </div>
        <div className="flex items-center justify-start gap-2">
          <h3 className="rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
            <Countdown
              date={new Date(smsPva.expireAt)}
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
              onClick={() => onCancel(smsPva.id)}
              className="flex w-16 items-center justify-center rounded-sm bg-red-300 p-1 px-3 text-red-700"
            >
              refund
            </button>
            <button
              onClick={() => onBlock(smsPva.id)}
              className="flex w-16 items-center justify-center rounded-sm bg-gray-300 p-1 px-3 text-gray-700"
            >
              Ban
            </button>
          </div>
        </div>
      </div>
      <div className="mt-2 flex w-full justify-start gap-2">
        <div className="relative h-5 w-7 overflow-hidden ">
          <Image
            src={
              services.find((service) => service.code === smsPva.serviceCode)
                ?.icon as string
            }
            alt="Service Icon"
            fill
            className="object-contain"
          />
        </div>
        <span>
          {
            services.find((service) => service.code === smsPva.serviceCode)
              ?.title as string
          }
        </span>
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
