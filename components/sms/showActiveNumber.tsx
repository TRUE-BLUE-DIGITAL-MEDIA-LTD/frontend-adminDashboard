import { UseQueryResult, useQuery } from "@tanstack/react-query";
import React from "react";
import {
  CancelNumberSMSService,
  GetActiveNumberSMSService,
  ResponseGetActiveNumberSMSService,
} from "../../services/tools/sms";
import { RiErrorWarningLine } from "react-icons/ri";
import { GiCancel } from "react-icons/gi";
import Countdown from "react-countdown";
import Image from "next/image";
import { countries } from "../../data/country";
import { services } from "../../data/services";
import { ErrorMessages } from "../../models";
import Swal from "sweetalert2";

type ShowActiveNumberProps = {
  activeNumber: UseQueryResult<ResponseGetActiveNumberSMSService, Error>;
};
function ShowActiveNumber({ activeNumber }: ShowActiveNumberProps) {
  const handleDeleteNumber = async (tzid: number) => {
    const replacedText = "delete";
    let content = document.createElement("div");
    content.innerHTML =
      "<div>Please type this</div> <strong>" +
      replacedText +
      "</strong> <div>to confirm deleting</div>";
    const { value } = await Swal.fire({
      title: "Delete Number",
      input: "text",
      footer: "Please type this <strong>delete</strong> to confirm deleting",
      html: content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (value !== replacedText) {
          return "Please Type Correctly";
        }
      },
    });
    if (value) {
      try {
        Swal.fire({
          title: "Loading",
          html: "Please wait.",
          allowEscapeKey: false,
          allowOutsideClick: false,

          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await CancelNumberSMSService({
          tzid: tzid,
        });
        if (response.response !== 1) {
          throw new Error(response.response as string);
        }
        await activeNumber.refetch();

        Swal.fire({
          title: "Success",
          text: "Number deleted successfully",
          icon: "success",
        });
      } catch (error) {
        let result = error as ErrorMessages;
        Swal.fire({
          title: result.error ? result.error : "Something went wrong!",
          text: result.message.toString(),
          footer: result.statusCode
            ? "Error code: " + result.statusCode?.toString()
            : "",
          icon: "error",
        });
      }
    }
  };

  return (
    <section className="flex  flex-col items-start  justify-start gap-5 ">
      <h1 className="text-lg font-semibold">My numbers</h1>
      {activeNumber.data?.response === "ERROR_NO_OPERATIONS" && (
        <div className="flex  w-96 flex-col items-center justify-center gap-5 rounded-md bg-white p-5 ring-1 ring-gray-400 drop-shadow-xl">
          <RiErrorWarningLine className="text-5xl" />
          <h3 className="text-xl">No operations.</h3>
          <span className="text-sm">
            Order a number and use it to register in the selected app/website
          </span>
        </div>
      )}
      <ul className=" grid w-full grid-cols-3 gap-5">
        {activeNumber.data?.data.map((number) => {
          return (
            <div
              className=" w-full rounded-md bg-white p-3 ring-1 ring-gray-400 drop-shadow-xl"
              key={number.tzid}
            >
              <div className="flex justify-between border-b border-gray-400 pb-2">
                <div className="flex items-center justify-start gap-2">
                  <div className="relative h-5 w-7 overflow-hidden ">
                    <Image
                      src={
                        countries.find(
                          (country) =>
                            country.countryCode === `+${number.country}`,
                        )?.flag as string
                      }
                      alt="country flag"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">{number.number}</h3>
                </div>
                <div className="flex items-center justify-start gap-2">
                  <h3 className="rounded-sm bg-green-200 p-1 px-3 text-sm font-normal">
                    <Countdown
                      date={Date.now() + number.time * 1000}
                      onComplete={() => {
                        activeNumber.refetch();
                      }}
                      renderer={({ hours, minutes, seconds }) => {
                        return (
                          <span>
                            {minutes}:{seconds}
                          </span>
                        );
                      }}
                    />
                  </h3>
                  <button
                    onClick={() => handleDeleteNumber(number.tzid)}
                    className=" flex items-center justify-center rounded-sm bg-red-300 p-1 px-3 text-red-700"
                  >
                    <GiCancel />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex w-full justify-start gap-2">
                <div className="relative h-5 w-7 overflow-hidden ">
                  <Image
                    src={
                      services.find(
                        (service) => service.slug === number.service,
                      )?.icon as string
                    }
                    alt="Service Icon"
                    fill
                    className="object-contain"
                  />
                </div>
                <span>
                  {
                    services.find((service) => service.slug === number.service)
                      ?.title as string
                  }
                </span>
              </div>
              <div className="py-2">
                {number.msg ? (
                  <ul className="max-h-40 overflow-auto">
                    {number.msg.map((msg, index) => {
                      return (
                        <li
                          className="flex w-full flex-col gap-1 py-2 "
                          key={index}
                        >
                          <span>Message: {msg.msg}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>
                    An SMS with a code will appear here after you use the number
                    to receive SMS
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </ul>
    </section>
  );
}

export default ShowActiveNumber;
