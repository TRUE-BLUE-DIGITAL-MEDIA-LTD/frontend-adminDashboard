import React, { useState } from "react";
import { SmsTextVerified as TypeSmsTextVerified, User } from "../../models";
import { useGetTextverifieds } from "../../react-query";
import { RiErrorWarningLine } from "react-icons/ri";
import ActiceNumber from "./ActiceNumber";
import SelectService from "./SelectService";
import SmsTextVerifiedHistory from "./SmsTextVerifiedHistory";
import PopupLayout from "../../layouts/PopupLayout";
import SelectNumber from "./SelectNumber";

type Props = {
  user: User;
};
function SmsTextVerified({ user }: Props) {
  const activeNumbers = useGetTextverifieds({ isComplete: "non-complete" });
  const [selectSmsTextVerified, setSelectSmsTextVerified] =
    useState<TypeSmsTextVerified | null>(null);
  return (
    <>
      {selectSmsTextVerified && (
        <PopupLayout onClose={() => setSelectSmsTextVerified(null)}>
          <SelectNumber textverified={selectSmsTextVerified} />
        </PopupLayout>
      )}
      <header className="mt-10 flex w-full flex-col items-center justify-center border-b pb-5">
        <h1 className="text-4xl font-semibold text-gray-800">
          Oxy Textverified
        </h1>
        <span className="text-sm text-gray-500">
          We are the premier one stop shop for all your SMS, text, and voice
          verification needs. Exceptional service and competitive pricing sets
          us apart from the rest.
        </span>
        {(user.role === "admin" || user.role === "manager") && (
          <h1 className="mt-5 flex items-center justify-center gap-2 text-3xl">
            Balance :{" "}
            <div className="rounded-sm bg-gradient-to-r from-gray-600 to-gray-800 px-2 text-white">
              {activeNumbers.data?.balance.toLocaleString()}$
            </div>
          </h1>
        )}
      </header>
      <main className="mt-5 flex w-full flex-col items-center gap-5 pb-20">
        <section className="flex w-10/12  flex-col items-start  justify-start gap-5 ">
          <h1 className="text-lg font-semibold">My numbers</h1>
          {!activeNumbers.data ||
            (activeNumbers.data.data.length === 0 && (
              <div className="flex  w-96 flex-col items-center justify-center gap-5 rounded-md bg-white p-5 ring-1 ring-gray-400 drop-shadow-xl">
                <RiErrorWarningLine className="text-5xl" />
                <h3 className="text-xl">No operations.</h3>
                <span className="text-sm">
                  Order a number and use it to register in the selected
                  app/website
                </span>
              </div>
            ))}
          <ul className=" grid w-full grid-cols-3 gap-5">
            {activeNumbers.data?.data.map((number, index) => {
              return (
                <ActiceNumber
                  onOpen={() => setSelectSmsTextVerified(number)}
                  key={number.id}
                  smsTextverified={number}
                  sms={number.sms}
                />
              );
            })}
          </ul>
        </section>
        <section className="flex w-full justify-center gap-5">
          <SelectService activeNumbers={activeNumbers} />
        </section>

        <SmsTextVerifiedHistory />
      </main>
    </>
  );
}

export default SmsTextVerified;
