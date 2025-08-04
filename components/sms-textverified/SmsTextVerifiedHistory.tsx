import moment from "moment";
import Image from "next/image";
import { useState } from "react";
import { services } from "../../data/services";
import PopupLayout from "../../layouts/PopupLayout";
import { SmsTextVerified } from "../../models";
import { useGetTextverifieds } from "../../react-query";
import SelectNumber from "./SelectNumber";

function SmsTextVerifiedHistory() {
  const [page, setPage] = useState(1);
  const [selectSmsTextVerified, setSelectSmsTextVerified] =
    useState<SmsTextVerified | null>(null);
  const history = useGetTextverifieds({
    isComplete: "complete",
    page: page,
    limit: 10,
  });
  return (
    <>
      <header className="flex flex-col items-center">
        <h1 className="text-xl font-semibold text-black">All Verifications</h1>
        <h1 className="text-lg font-semibold text-gray-400">
          A history of all verifications.
        </h1>
      </header>
      {selectSmsTextVerified && (
        <PopupLayout onClose={() => setSelectSmsTextVerified(null)}>
          <SelectNumber textverified={selectSmsTextVerified} />
        </PopupLayout>
      )}
      <div className="mt-1 overflow-auto lg:w-10/12 xl:w-10/12 2xl:w-7/12">
        <table className="w-max min-w-full border">
          <thead>
            <tr className="bg-gray-300">
              <th>Date</th>
              <th>Phone Number</th>
              <th>Country</th>
              <th>Service</th>
              <th>Price</th>
              <th>Option</th>
            </tr>
          </thead>
          <tbody>
            {history.data?.data.map((sms) => {
              const service = services.find((s) => s.slug === sms.serviceCode);

              return (
                <tr key={sms.id} className="h-16 border-b">
                  <td>
                    <section className="flex flex-col gap-1 px-2">
                      <span className="font-semibold leading-none">
                        {moment(sms.createAt).format("DD MMMM YYYY")}
                      </span>
                      <span className="text-xs text-gray-500">
                        At {moment(sms.createAt).format("HH:mm")}
                      </span>
                    </section>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1 px-2">
                      {sms.phoneNumber}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-center">
                      <div className="relative h-5 w-5 overflow-hidden">
                        <Image
                          src={`/image/flags/1x1/${sms.country}.svg`}
                          fill
                          alt="flag"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-center">
                      ${sms.price}{" "}
                      {sms.isGetSms === true ? (
                        <div className="w-20 rounded-md bg-green-200 px-2 text-sm text-green-600">
                          SMS
                        </div>
                      ) : (
                        <div className="w-20 rounded-md bg-red-200 px-2 text-sm text-red-600">
                          NO SMS
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2 px-2">
                      <div className="relative h-10 w-10 overflow-hidden ">
                        <Image
                          src={service?.icon ?? "/favicon.ico"}
                          fill
                          alt="flag"
                          className="object-contain"
                        />
                      </div>
                      <span className="col-span-3 text-base">
                        {service?.title}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setSelectSmsTextVerified(sms)}
                        className="h-10 w-40 rounded-lg border bg-gray-950 text-white hover:scale-105 active:scale-110"
                      >
                        OPEN
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default SmsTextVerifiedHistory;
