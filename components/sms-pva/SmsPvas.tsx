import React from "react";
import SelectCountry from "./SelectCountry";
import SelectService from "./SelectService";
import {
  useBlockSmsPva,
  useCancelSmsPva,
  useCreateSmsPva,
  useGetAvailableNumberPVA,
  useGetSmsPva,
} from "../../react-query";
import { ErrorMessages, User } from "../../models";
import Swal from "sweetalert2";
import { RiErrorWarningLine } from "react-icons/ri";
import ActiceNumber from "./ActiceNumber";
import SmsPvaHistory from "./SmsPvaHistory";

type Props = {
  user: User;
};
function SmsPvas({ user }: Props) {
  const create = useCreateSmsPva();
  const cancel = useCancelSmsPva();
  const banNumner = useBlockSmsPva();

  const [selectCountry, setSelectCountry] = React.useState("uk");
  const [selectService, setSelectService] = React.useState("");
  const activeNumbers = useGetSmsPva();
  const handleSelectService = async (value: string) => {
    try {
      if (!selectCountry) {
        throw new Error("Please select a country");
      }
      if (!value) {
        throw new Error("Please select a service");
      }

      setSelectService(value);
      Swal.fire({
        title: "Loading",
        html: "Please wait.",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const response = await create.mutateAsync({
        country: selectCountry,
        service: value,
      });
      await activeNumbers.refetch();
      Swal.fire({
        title: "Success",
        text: "Number has been successfully created.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
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
  };

  const handleRemoveActiveSms = async (id: string, type: "cancel" | "ban") => {
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
      if (type === "cancel") {
        await cancel.mutateAsync({
          smsPvaId: id,
        });
      }

      if (type === "ban") {
        await banNumner.mutateAsync({
          smsPvaId: id,
        });
      }

      Swal.fire({
        title: "Success",
        text: "Operation has been successfully completed.",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
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
  };
  return (
    <>
      <header className="mt-10 flex w-full flex-col items-center justify-center border-b pb-5">
        <h1 className="text-4xl font-semibold text-gray-800">Sms Pva</h1>
        <span className="text-sm text-gray-500">
          SmsPva provides the opportunity to use short-term temp phone numbers
          from different countries at fair and affordable prices for receiving
          SMS messages.
        </span>
      </header>
      <main className="mt-5 flex w-full flex-col items-center gap-5 pb-20">
        <section className="flex w-10/12  flex-col items-start  justify-start gap-5 ">
          <h1 className="text-lg font-semibold">My numbers</h1>
          {!activeNumbers.data ||
            (activeNumbers.data.length === 0 && (
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
            {activeNumbers.data?.map((number, index) => {
              return (
                <ActiceNumber
                  key={index}
                  smsPva={number}
                  sms={number.sms}
                  onBlock={(id) => {
                    handleRemoveActiveSms(id, "ban");
                  }}
                  onCancel={(id) => {
                    handleRemoveActiveSms(id, "cancel");
                  }}
                />
              );
            })}
          </ul>
        </section>
        <section className="flex w-full justify-center gap-5">
          <SelectCountry
            selectCountry={selectCountry}
            onSelectCountry={(value) => {
              setSelectCountry(value);
            }}
          />
          <SelectService
            country={selectCountry}
            selectService={selectService}
            onSelectService={(value) => {
              handleSelectService(value);
            }}
          />
        </section>

        <SmsPvaHistory user={user} />
      </main>
    </>
  );
}

export default SmsPvas;
