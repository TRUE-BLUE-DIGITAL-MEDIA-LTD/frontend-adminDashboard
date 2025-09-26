import { UseQueryResult } from "@tanstack/react-query";
import moment from "moment";
import Image from "next/image";
import { useState } from "react";
import Swal from "sweetalert2";
import { countries } from "../../data/country";
import { ErrorMessages, SmsDaisy, SmsPinverify } from "../../models";
import {
  useGetHistorySmsDaisy,
  useResendSmsDaisy,
  useReuseSmsPinverify,
} from "../../react-query";
import { ResponseGetSmsDaisyService } from "../../services/sms-daisy";
import { ResponseGetSMSPinverifyService } from "../../services/sms-pinverify";

type Props = {
  activeNumbers: UseQueryResult<ResponseGetSmsDaisyService, Error>;
};
function SmsDaisyHistory({ activeNumbers }: Props) {
  const [page, setPage] = useState(1);
  const history = useGetHistorySmsDaisy({
    page: page,
    limit: 50,
  });

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
              <th>Option</th>
            </tr>
          </thead>
          <tbody>
            {history.data?.data.map((sms) => {
              return (
                <ItemHistory
                  key={sms.id}
                  sms={sms}
                  activeNumbers={activeNumbers}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default SmsDaisyHistory;

type PropsItemHistory = {
  sms: SmsDaisy;
  activeNumbers: UseQueryResult<ResponseGetSmsDaisyService, Error>;
};
function ItemHistory({ sms, activeNumbers }: PropsItemHistory) {
  const resend = useResendSmsDaisy();
  const handleResend = async (id: string) => {
    try {
      await resend.mutateAsync({
        smsDaisyId: id,
      });
      await activeNumbers.refetch();
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error ? result.error : "Something went wrong!",
        text: result?.message?.toString(),
        footer: result?.statusCode
          ? "Error code: " + result.statusCode?.toString()
          : "",
        icon: "error",
      });
    }
  };
  const country = countries.find((c) => c.sms_pinverify === sms.country);
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
              src={country?.flag ?? ""}
              fill
              alt="flag"
              className="object-contain"
            />
          </div>
        </div>
      </td>
      <td>
        <div className="flex w-40 items-center justify-center gap-1 text-center">
          {sms.isGetSms === true ? (
            <div className=" w-40 rounded-md bg-green-200 px-2 text-sm text-green-600">
              SMS ${sms.price}
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
          {sms.serviceCode}
        </div>
      </td>
      <td>
        <div className="flex items-center justify-center">
          <button
            disabled={resend.isPending}
            onClick={() => handleResend(sms.id)}
            className="h-10 w-40 rounded-lg border bg-gray-950 text-white hover:scale-105 active:scale-110"
          >
            {resend.isPending ? "Loading.." : "Reused"}
          </button>
        </div>
      </td>
    </tr>
  );
}
