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
  const price = useGetServicePrice({ country, service: service.code });
  return (
    <li
      className={` flex  cursor-pointer items-center justify-between p-2  
             hover:bg-gray-200 ${selectService === service.slug ? "bg-gray-200" : ""}`}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="relative h-10 w-10 overflow-hidden ">
          <Image
            src={service.icon ?? "/favicon.ico"}
            fill
            alt="flag"
            className="object-contain"
          />
        </div>
        <span className="col-span-3 text-base">{service.title}</span>
      </div>
      <div className="flex items-center justify-end gap-2">
        {loadingNumberAvailable ? (
          <div className="h-2 w-5 animate-pulse rounded-full bg-gray-400"></div>
        ) : (
          <span className="text-sm font-normal text-gray-400">
            {totalAvailable}
          </span>
        )}

        <button
          onClick={() => {
            onSelectService(service.code);
          }}
          className={`w-24 rounded-lg bg-blue-200 px-2 py-1 text-sm
                  
                 font-semibold text-blue-700 transition duration-100 hover:bg-blue-300 active:scale-105`}
        >
          {price.isLoading ? "loading" : `${price.data?.price} $`}
        </button>
      </div>
    </li>
  );
}

export default memo(ServiceCard);
