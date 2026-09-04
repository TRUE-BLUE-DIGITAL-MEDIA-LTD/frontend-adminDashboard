import moment from "moment";
import Image from "next/image";
import { useState } from "react";
import { useGetHistorySmsVirtualsms } from "../../react-query";
import { flagUrl } from "./SelectService";

function SmsVirtualsmsHistory() {
  const [page, setPage] = useState(1);
  const history = useGetHistorySmsVirtualsms({ page, limit: 50 });
  const totalPage = history.data?.totalPage ?? 0;

  return (
    <>
      <header className="flex flex-col items-center">
        <h1 className="text-xl font-semibold text-black">All Verifications</h1>
        <h1 className="text-lg font-semibold text-gray-400">
          A history of all verifications.
        </h1>
      </header>
      <div className="mt-1 overflow-auto lg:w-10/12 xl:w-10/12 2xl:w-7/12">
        <table className="w-max min-w-full border">
          <thead>
            <tr className="bg-gray-300">
              <th>Date</th>
              <th>Phone Number</th>
              <th>Country</th>
              <th>SMS</th>
              <th>Service</th>
            </tr>
          </thead>
          <tbody>
            {history.data?.data.map((sms) => (
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
                  <div className="flex items-center justify-center px-2">
                    {sms.phoneNumber}
                  </div>
                </td>
                <td>
                  <div className="flex items-center justify-center gap-1">
                    <div className="relative h-5 w-5 overflow-hidden">
                      <Image
                        src={flagUrl(sms.country)}
                        fill
                        alt="flag"
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs">{sms.country}</span>
                  </div>
                </td>
                <td>
                  <div className="flex w-48 items-center justify-center text-center">
                    {sms.isGetSms ? (
                      <div className="w-48 rounded-md bg-green-200 px-2 text-sm text-green-600">
                        SMS ${sms.price.toFixed(2)} - {sms.message}
                      </div>
                    ) : (
                      <div className="w-20 rounded-md bg-red-200 px-2 text-sm text-red-600">
                        NO SMS
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex items-center justify-center px-2">
                    {sms.serviceCode}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPage > 1 && (
        <div className="flex items-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm">
            {page} / {totalPage}
          </span>
          <button
            disabled={page >= totalPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default SmsVirtualsmsHistory;
