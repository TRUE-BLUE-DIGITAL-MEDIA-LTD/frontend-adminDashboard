import { useQuery } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import { Form } from "react-aria-components";
import { BonusRate, ErrorMessages, User } from "../../../models";
import {
  GetBonusRateByUserIdService,
  ResetBonusRateService,
  UpdateBonusRateService,
} from "../../../services/bonus";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";
import Swal from "sweetalert2";
import { BiReset } from "react-icons/bi";

type UpdateBonusRateProps = {
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
};
function UpdateBonusRate({ setTrigger, userId }: UpdateBonusRateProps) {
  const [bonusState, setBonusState] = useState<BonusRate[]>([]);

  const bonusRate = useQuery({
    queryKey: ["bonusRate", { userId: userId }],
    queryFn: () =>
      GetBonusRateByUserIdService({ userId: userId }).then((response) => {
        return response;
      }),
  });

  useEffect(() => {
    if (bonusRate.data) {
      setBonusState(() => {
        return bonusRate.data
          .sort((a, b) => a.from - b.from)
          .map((rate) => ({
            ...rate,
            rate: rate.rate * 100,
          }));
      });
    }
  }, [bonusRate.isSuccess, bonusRate.data]);
  const handleChange = ({
    e,
    id,
  }: {
    e: InputNumberChangeEvent;
    id: string;
  }) => {
    const { name } = e.originalEvent.target as HTMLInputElement;

    setBonusState((prev) =>
      prev.map((rate) =>
        rate.id === id ? { ...rate, [name]: e.value } : rate,
      ),
    );
  };

  const handleResetRate = async () => {
    try {
      Swal.fire({
        title: "Loading",
        text: "Please wait.",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });
      await ResetBonusRateService({ userId: userId });
      await bonusRate.refetch();
      Swal.fire({
        title: "Success",
        text: "Bonus rate reset",
        icon: "success",
      });
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };

  const handelUpdate = async (e: FormEvent) => {
    try {
      e.preventDefault();
      Swal.fire({
        title: "Loading",
        text: "Please wait.",
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const bonusRefector = bonusState.map((rate) => {
        return {
          ...rate,
          rate: rate.rate / 100,
        };
      });
      const update = await Promise.allSettled(
        bonusRefector.map((rate) => {
          return UpdateBonusRateService({
            query: {
              bonusId: rate.id,
            },
            body: {
              from: rate.from,
              to: rate.to,
              rate: rate.rate,
            },
          });
        }),
      );

      const sucessfulUpdate = update.filter((bonus) => {
        if (bonus.status === "fulfilled") {
          return bonus.value;
        }
      });

      const failedUpdate = update.filter((bonus) => {
        if (bonus.status === "rejected") {
          return bonus.reason;
        }
      });
      await bonusRate.refetch();
      if (failedUpdate.length > 0) {
        console.log("update fail", failedUpdate);
        throw new Error("Failed to update bonus rate");
      }

      Swal.fire({
        title: "Success",
        text: "Bonus rate updated",
        icon: "success",
      });

      // update bonus rate
    } catch (error) {
      console.log(error);
      let result = error as ErrorMessages;
      Swal.fire({
        title: result.error,
        text: result.message.toString(),
        footer: "Error Code :" + result.statusCode?.toString(),
        icon: "error",
      });
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 top-0 
    z-50 m-auto flex h-screen w-screen items-center justify-center font-Poppins"
    >
      <main className="h-max w-96 rounded-md bg-white p-5">
        <Form
          onSubmit={handelUpdate}
          className="flex h-full w-full flex-col items-center justify-start 
        gap-5 rounded-lg  p-2 ring-2 ring-slate-300 "
        >
          <button
            type="button"
            onClick={handleResetRate}
            className="flex items-center justify-center gap-1 rounded-md px-3 text-black
           ring-1 ring-green-500 transition duration-150 hover:bg-green-500 hover:text-white "
          >
            <BiReset />
            Reset Rate
          </button>
          <h1 className="text-2xl font-bold">Update Bonus Rate</h1>
          <div className="flex h-80 w-full flex-col gap-2 overflow-auto p-2">
            {bonusState.map((rate) => (
              <div key={rate.id} className="flex w-full gap-2">
                <label className="flex w-1/3 flex-col  ">
                  <span className="text-xs">from</span>
                  <InputNumber
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    type="text"
                    onChange={(e) => handleChange({ e, id: rate.id })}
                    name="from"
                    value={rate.from}
                    inputMode="numeric"
                    defaultValue={rate.from}
                    className="w-20 rounded-md border border-slate-300 p-1"
                  />
                </label>
                <label className="flex w-1/3 flex-col ">
                  <span className="text-xs">to</span>
                  <InputNumber
                    mode="currency"
                    currency="USD"
                    locale="en-US"
                    value={rate.to}
                    name="to"
                    onChange={(e) => handleChange({ e, id: rate.id })}
                    type="text"
                    inputMode="numeric"
                    defaultValue={rate.to}
                    className="w-20 rounded-md border border-slate-300 p-1"
                  />
                </label>
                <label className="flex w-1/3 flex-col ">
                  <span className="text-xs">rate</span>
                  <InputNumber
                    prefix="% "
                    max={100}
                    min={0}
                    onChange={(e) => handleChange({ e, id: rate.id })}
                    name="rate"
                    inputMode="numeric"
                    value={rate.rate}
                    defaultValue={rate.rate}
                    className="w-20 rounded-md border border-slate-300 p-1"
                  />
                </label>
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-white py-2 text-green-500
             ring-2 ring-green-500 transition-all duration-300 hover:bg-green-500 hover:text-white"
          >
            Update
          </button>
        </Form>
      </main>
      <footer
        onClick={() => {
          setTrigger(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 h-screen w-screen bg-black/50 "
      ></footer>
    </div>
  );
}

export default UpdateBonusRate;
