import { useQuery, UseQueryResult } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import { Form } from "react-aria-components";
import {
  BonusCalculatePeriod,
  BonusRate,
  ErrorMessages,
  User,
} from "../../../models";
import {
  CreateBonusRateService,
  DeleteBonusRateService,
  GetBonusRateByUserIdService,
  ResetBonusRateService,
  UpdateBonusRateService,
} from "../../../services/bonus";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";
import Swal from "sweetalert2";
import { BiReset } from "react-icons/bi";
import crypto from "crypto";
import { UpdateUserService } from "../../../services/admin/user";
import {
  EditAccountService,
  ResponseGetAllAccountByPageService,
} from "../../../services/admin/account";

const bonusList: { title: BonusCalculatePeriod }[] = [
  {
    title: "daily",
  },
  {
    title: "monthly",
  },
] as const;
type UpdateBonusRateProps = {
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  user: User;
  accounts: UseQueryResult<ResponseGetAllAccountByPageService, Error>;
};
function UpdateBonusRate({ setTrigger, user, accounts }: UpdateBonusRateProps) {
  const [bonusStatus, setBonusStatus] = useState<BonusCalculatePeriod>(
    user.bonusCalculatePeriod,
  );
  const [bonusState, setBonusState] = useState<
    {
      id?: string | undefined;
      from: number;
      to: number;
      rate: number;
      fakeId?: string | undefined;
    }[]
  >([]);

  const bonusRate = useQuery({
    queryKey: ["bonusRate", { userId: user.id }],
    queryFn: () =>
      GetBonusRateByUserIdService({ userId: user.id }).then((response) => {
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
    fakeId,
  }: {
    e: InputNumberChangeEvent;
    id?: string | undefined;
    fakeId?: string | undefined;
  }) => {
    const { name } = e.originalEvent.target as HTMLInputElement;

    if (id) {
      setBonusState((prev) =>
        prev.map((rate) =>
          rate.id === id ? { ...rate, [name]: e.value } : rate,
        ),
      );
    } else if (fakeId) {
      setBonusState((prev) =>
        prev.map((rate) =>
          rate.fakeId === fakeId ? { ...rate, [name]: e.value } : rate,
        ),
      );
    }
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
      await ResetBonusRateService({ userId: user.id });
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

      const exsitingBonus = bonusRefector.filter(
        (
          rate,
        ): rate is { id: string; from: number; to: number; rate: number } =>
          rate.id !== undefined,
      );
      const newBonus = bonusRefector.filter(
        (rate): rate is { from: number; to: number; rate: number } =>
          rate.id === undefined,
      );

      await Promise.allSettled([
        EditAccountService({
          userId: user.id,
          bonusCalculatePeriod: bonusStatus,
        }),
        ...exsitingBonus.map((rate) => {
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
        ...newBonus.map((rate) => {
          return CreateBonusRateService({
            userId: user.id,
            from: rate.from,
            to: rate.to,
            rate: rate.rate,
          });
        }),
      ]);

      await Promise.allSettled([bonusRate.refetch(), accounts.refetch()]);

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

  const handleRemove = async ({
    mongodbId,
    fakeId,
  }: {
    mongodbId?: string | undefined;
    fakeId?: string | undefined;
  }) => {
    try {
      if (mongodbId) {
        await DeleteBonusRateService({
          bonusId: mongodbId,
        });
        await bonusRate.refetch();
      } else if (fakeId) {
        setBonusState((prev) => prev.filter((rate) => rate.fakeId !== fakeId));
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-Poppins">
      <main className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Bonus rate</h2>
            <p className="text-xs text-zinc-500">
              Configure tiers for this user
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetRate}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300 transition hover:bg-emerald-500/25"
            >
              <BiReset />
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                setTrigger(() => false);
                document.body.style.overflow = "auto";
              }}
              className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>
        <Form onSubmit={handelUpdate} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-400">
                Calculate period
              </span>
              <select
                value={bonusStatus}
                onChange={(e) =>
                  setBonusStatus(e.target.value as BonusCalculatePeriod)
                }
                className="w-full max-w-xs rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-main-color focus:ring-1 focus:ring-main-color/40"
              >
                {bonusList.map((bonus) => (
                  <option key={bonus.title} value={bonus.title}>
                    {bonus.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex max-h-72 flex-col gap-2 overflow-auto">
              {bonusState.map((rate) => (
                <div
                  key={rate.id ?? rate.fakeId}
                  className="grid grid-cols-4 gap-2 rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">From</span>
                    <InputNumber
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      type="text"
                      onChange={(e) =>
                        handleChange({ e, id: rate.id, fakeId: rate.fakeId })
                      }
                      name="from"
                      value={rate.from}
                      inputMode="numeric"
                      defaultValue={rate.from}
                      className="w-full rounded-lg border border-white/10 bg-zinc-950 p-1 text-black"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">To</span>
                    <InputNumber
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      value={rate.to}
                      name="to"
                      onChange={(e) =>
                        handleChange({ e, id: rate.id, fakeId: rate.fakeId })
                      }
                      type="text"
                      inputMode="numeric"
                      defaultValue={rate.to}
                      className="w-full rounded-lg border border-white/10 bg-zinc-950 p-1 text-black"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-400">Rate</span>
                    <InputNumber
                      prefix="% "
                      max={100}
                      min={0}
                      onChange={(e) =>
                        handleChange({ e, id: rate.id, fakeId: rate.fakeId })
                      }
                      name="rate"
                      inputMode="numeric"
                      value={rate.rate}
                      defaultValue={rate.rate}
                      className="w-full rounded-lg border border-white/10 bg-zinc-950 p-1 text-black"
                    />
                  </label>
                  <div className="flex flex-col justify-end gap-1">
                    <span className="text-xs text-zinc-400">Action</span>
                    <button
                      onClick={() => {
                        handleRemove({
                          mongodbId: rate.id,
                          fakeId: rate.fakeId,
                        });
                      }}
                      type="button"
                      className="rounded-full border border-rose-500/40 bg-rose-500/20 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setBonusState((prev) => [
                    ...prev,
                    {
                      from: 0,
                      to: 0,
                      rate: 0,
                      fakeId: crypto.randomBytes(10).toString("hex"),
                    },
                  ])
                }
                className="rounded-full border border-dashed border-white/15 bg-white/5 py-2 text-sm text-zinc-300 transition hover:border-main-color/40 hover:text-main-color"
              >
                + Add tier
              </button>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={() => {
                setTrigger(() => false);
                document.body.style.overflow = "auto";
              }}
              className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-main-color hover:text-white"
            >
              Update
            </button>
          </div>
        </Form>
      </main>
      <footer
        onClick={() => {
          setTrigger(() => false);
          document.body.style.overflow = "auto";
        }}
        className="fixed inset-0 -z-10 bg-black/70"
      ></footer>
    </div>
  );
}

export default UpdateBonusRate;
