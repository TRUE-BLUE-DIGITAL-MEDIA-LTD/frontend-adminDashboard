import React, { useEffect, useState } from "react";
import { useGetSummaryTransacntionOxypoint } from "../../react-query";
import { Partner, User } from "../../models";
import { Nullable } from "primereact/ts-helpers";
import { useQuery } from "@tanstack/react-query";
import { GetAllAccountByPageService } from "../../services/admin/account";
import Image from "next/image";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";

type Props = {
  user: User;
};
type SimSummary = {
  type: string;
  usage: number;
  number: number;
};

const timePeriods = [
  "Last 30 Days",
  "Today",
  "Yesterday",
  "This Month",
  "Last Month",
  "Custom Range",
] as const;
type TimePeriod = (typeof timePeriods)[number];

function SummaryTransaction({ user }: Props) {
  const [selectUser, setSelectUser] = useState<User>();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("Today");

  const [dateStart, setDateStart] = useState<{
    actual?: Nullable<Date | null>;
    delay?: Nullable<Date | null>;
  }>();
  const [dateEnd, setDateEnd] = useState<{
    actual?: Nullable<Date | null>;
    delay?: Nullable<Date | null>;
  }>();

  const account = useQuery({
    queryKey: ["account", { page: 1, limit: 100 }],
    queryFn: () => GetAllAccountByPageService({ page: 1, limit: 100 }),
    enabled: user.role === "admin",
  });

  const data = useGetSummaryTransacntionOxypoint({
    endDate: dateEnd?.actual?.toISOString() as string,
    startDate: dateStart?.actual?.toISOString() as string,
    ...(user.role === "admin" && selectUser
      ? { partnerId: selectUser.partnerId }
      : user.role === "admin" && !selectUser && { partnerId: user.partnerId }),
    ...(user.role === "manager" && { managerId: user.id }),
    ...(user.role === "partner" && { partnerId: user.id }),
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setDateStart((prev) => {
        return {
          ...prev,
          actual: prev?.delay,
        };
      });
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [dateStart]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setDateEnd((prev) => {
        return {
          ...prev,
          actual: prev?.delay,
        };
      });
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [dateEnd]);

  const hanldeDateChanging = (newTimePeriod: TimePeriod) => {
    const now = new Date();
    let startDate: Nullable<Date> = new Date();
    let endDate: Nullable<Date> = new Date();

    switch (newTimePeriod) {
      case "Today":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Yesterday":
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(now.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Last 30 Days":
        startDate.setDate(now.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "This Month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Last Month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Day 0 of current month
        endDate.setHours(23, 59, 59, 999);
        break;
      case "Custom Range":
      default:
        // Let user pick, don't change dates
        return;
    }
    // Set both 'actual' and 'delay' to update query and UI
    setDateStart({ actual: startDate, delay: startDate });
    setDateEnd({ actual: endDate, delay: endDate });
  };

  useEffect(() => {
    hanldeDateChanging("Today");
  }, []);

  const getSimTypeColor = (simType: string) => {
    if (simType.includes("DAISY")) return "bg-cyan-400";
    if (simType.includes("POOL")) return "bg-green-400";
    if (simType.includes("TEXT")) return "bg-orange-400";
    if (simType.includes("PIN")) return "bg-indigo-400";
    if (simType.includes("PVA")) return "bg-yellow-400";
    return "bg-gray-400";
  };

  // Calculates the rate for a single SIM
  const getSimRate = (sim: SimSummary) => {
    if (!sim.number || sim.number === 0) return 0;
    return sim.usage / sim.number;
  };

  // Calculates totals for a user
  const getUserTotals = (sims: SimSummary[]) => {
    const totalNumber = sims.reduce((acc, sim) => acc + sim.number, 0);
    const totalUsage = sims.reduce((acc, sim) => acc + sim.usage, 0);
    const avgRate = totalNumber === 0 ? 0 : totalUsage / totalNumber;

    return { totalNumber, totalUsage, avgRate };
  };
  const grandTotalMessages =
    data.data?.reduce(
      (acc, item) => acc + getUserTotals(item.sims).totalNumber,
      0,
    ) ?? 0;
  const grandTotalUsage =
    data.data?.reduce(
      (acc, item) => acc + getUserTotals(item.sims).totalUsage,
      0,
    ) ?? 0;
  const grandAvgRate =
    grandTotalMessages === 0 ? 0 : grandTotalUsage / grandTotalMessages;
  return (
    <div className="mt-10 rounded-xl bg-white p-6 shadow-md ">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Summary Transactions
        </h2>
      </div>
      <header className="flex gap-3">
        {user.role === "admin" && (
          <div className={`flex flex-col`}>
            <label className="text-xs ">Select User</label>
            <Dropdown
              value={selectUser}
              onChange={(e) => {
                setSelectUser(() => e.value);
              }}
              options={account?.data?.accounts}
              placeholder="Select User"
              valueTemplate={(
                option: User & {
                  partner: Partner | null;
                },
              ) => {
                if (!option) return <>No user select</>;
                return (
                  <span className="font-semibold leading-none">
                    {option.name}
                  </span>
                );
              }}
              showClear
              loading={account.isLoading}
              itemTemplate={(
                option: User & {
                  partner: Partner | null;
                },
              ) => (
                <section className="flex items-center gap-2">
                  <div className="relative h-10 w-10 rounded-lg ">
                    <Image
                      src={option.image}
                      layout="fill"
                      alt="user image"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold leading-none">
                      {option.name}
                    </span>
                    <span className="text-xs">{option.email}</span>
                  </div>
                </section>
              )}
              className={`h-10 w-60 rounded  border border-gray-400 text-gray-800 `}
            />
          </div>
        )}
        <div className="flex flex-col">
          <label htmlFor="time-period" className=" text-xs ">
            Time Period
          </label>
          <select
            id="time-period"
            value={timePeriod}
            onChange={(e) => {
              const newTimePeriod = e.target.value as TimePeriod;
              setTimePeriod(newTimePeriod);
              hanldeDateChanging(newTimePeriod);
            }}
            className="h-10 w-32 rounded  border border-gray-400 text-gray-800 "
          >
            {timePeriods.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <label className="flex flex-col">
          <span className="text-xs">Pick Time Start</span>
          <Calendar
            className="h-10 w-48 rounded  border border-gray-400 text-gray-800 "
            value={dateStart?.delay}
            showTime
            hourFormat="24"
            onChange={(e) =>
              setDateStart((prev) => ({
                ...prev,
                delay: e.value,
              }))
            }
            readOnlyInput
            hideOnRangeSelection
            showButtonBar
            showIcon
            disabled={timePeriod !== "Custom Range"}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-xs">Pick Time End</span>
          <Calendar
            className="h-10 w-48 rounded  border border-gray-400 text-gray-800 "
            value={dateEnd?.delay}
            showTime
            hourFormat="24"
            onChange={(e) => {
              setDateEnd((prev) => ({
                ...prev,
                delay: e.value,
              }));
            }}
            readOnlyInput
            hideOnRangeSelection
            showButtonBar
            showIcon
            disabled={timePeriod !== "Custom Range"}
          />
        </label>
      </header>
      <main className="mt-5 overflow-x-auto  bg-white text-gray-800 ">
        <table className="w-full min-w-[1200px] text-left text-sm">
          {/* --- Table Header --- */}
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th scope="col" className="px-6 py-3">
                Partner Name
              </th>
              <th scope="col" className="px-6 py-3">
                SMS System
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                # Messages
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                $ Cost
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                $ Rate (Avg)
              </th>
              <th scope="col" className="px-6 py-3">
                Totals
              </th>
            </tr>
          </thead>

          {/* --- Table Body --- */}
          <tbody>
            {data.isLoading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Loading data...
                </td>
              </tr>
            ) : data.data?.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No summary data.data? found for the selected criteria.
                </td>
              </tr>
            ) : (
              data.data
                ?.sort((a, b) => b.sims.length - a.sims.length)
                .map((transaction) => {
                  const { user, sims } = transaction;
                  const { totalNumber, totalUsage, avgRate } =
                    getUserTotals(sims);

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 align-top hover:bg-gray-50"
                    >
                      {/* 1. User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.image || "/default-avatar.png"}
                            alt={user.name || "avatar"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* --- Cells with nested SIM data --- */}
                      {sims.length === 0 ? (
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center italic text-gray-400"
                        >
                          No transactions
                        </td>
                      ) : (
                        <>
                          {/* 2. SMS System */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {sims.map((sim) => (
                                <div
                                  key={sim.type}
                                  className="flex items-center gap-2"
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${getSimTypeColor(
                                      sim.type,
                                    )}`}
                                  ></span>
                                  {sim.type}
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* 3. # Messages */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col gap-1 font-mono">
                              {sims.map((sim) => (
                                <div key={sim.type}>
                                  {sim.number.toLocaleString()}
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* 4. $ Cost */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col gap-1 font-mono font-medium text-green-700">
                              {sims.map((sim) => (
                                <div key={sim.type}>
                                  ${sim.usage.toFixed(2)}
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* 5. $ Rate (Avg) */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-col gap-1 font-mono text-gray-500">
                              {sims.map((sim) => (
                                <div key={sim.type}>
                                  ${getSimRate(sim).toFixed(3)}
                                </div>
                              ))}
                            </div>
                          </td>
                        </>
                      )}

                      {/* 6. Totals */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="text-gray-900">
                            Total:{" "}
                            <span className="font-semibold">
                              {totalNumber.toLocaleString()}
                            </span>
                          </div>
                          <div className="font-semibold text-green-700">
                            ${totalUsage.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Avg: ${avgRate.toFixed(3)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>

          {/* --- Table Footer --- */}
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold text-gray-900">
              <td className="px-6 py-4" colSpan={2}>
                Grand Total
              </td>
              <td className="px-6 py-4 text-right">
                {grandTotalMessages.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right text-green-700">
                ${grandTotalUsage.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-right text-gray-600">
                ${grandAvgRate.toFixed(3)}
              </td>
              <td className="px-6 py-4" colSpan={2}>
                {/* Empty footer cells */}
              </td>
            </tr>
          </tfoot>
        </table>
      </main>
    </div>
  );
}

export default SummaryTransaction;
