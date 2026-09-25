import Image from "next/image";
import React, { memo } from "react";
import { useGetServicePrice } from "../../react-query";

type Props = {
  selectService: string;
  service: {
    title: string;
    slug: string;
    icon: string;
    code: string;
  };
  loadingNumberAvailable: boolean;
  totalAvailable: number;
  onSelectService: (service: string) => void;
  country: string;
};
function ServiceCard({
  selectService,
  service,
  country,
  loadingNumberAvailable,
  totalAvailable,
  onSelectService,
}: Props) {
  // const price = useGetServicePrice({ country, service: service.code });
  return (
    <li
      className={` flex  cursor-pointer items-center justify-between p-2  
             hover:bg-hover ${selectService === service.slug ? "bg-panel-raised" : ""}`}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="relative h-10 w-10 overflow-hidden ">
          <Image
            src={service.icon ?? "/favicon.ico"}
            fill
            alt="flag"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
          />
        </div>
        <span className="col-span-3 text-base">{service.title}</span>
      </div>
      <div className="flex items-center justify-end gap-2">
        {loadingNumberAvailable ? (
          <div className="h-2 w-5 animate-pulse rounded-full bg-panel-raised"></div>
        ) : (
          <span className="text-sm font-normal text-fg-subtle">
            {totalAvailable}
          </span>
        )}

        <button
          onClick={() => {
            onSelectService(service.code);
          }}
          className={`w-24 rounded-lg bg-blue-500/20 px-2 py-1 text-sm
                  
                 font-semibold text-blue-700 dark:text-blue-400 transition duration-100 hover:bg-blue-300 active:scale-105`}
        >
          BUY
        </button>
      </div>
    </li>
  );
}

export default memo(ServiceCard);
