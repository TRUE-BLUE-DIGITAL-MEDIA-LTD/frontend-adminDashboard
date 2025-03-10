import React, { useState } from "react";
import { useGetByPageSmsPva } from "../../react-query";
import { useQuery } from "@tanstack/react-query";
import { GetAllAccountByPageService } from "../../services/admin/account";
import { Partner, User } from "../../models";
import { Dropdown } from "primereact/dropdown";
import Image from "next/image";
import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import moment from "moment";
import { countries } from "../../data/country";
import { services } from "../../data/services";

type Props = {
  user: User;
};
function SmsPvaHistory({ user }: Props) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const account = useQuery({
    queryKey: ["account", { page: 1, limit: 100 }],
    queryFn: () => GetAllAccountByPageService({ page: 1, limit: 100 }),
    enabled: user.role === "admin" || user.role === "manager",
  });

  const [page, setPage] = useState<number>(1);
  const [selectUser, setSelectUser] = useState<User | undefined>();
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>(null);
  const smsPvas = useGetByPageSmsPva({
    startDate: dates?.[0]?.toISOString(),
    endDate: dates?.[1]?.toISOString(),
    limit: 100,
    page,
    userId: selectUser?.id ?? user.id,
    timezone: userTimezone,
  });
  return (
    <div>
      <div className="flex w-full flex-col">
        <h1 className="text-2xl font-semibold">Sms Pva History</h1>
        <span>
          all history record will show only sim that get the sms and has been
          charged from smspva.com
        </span>
      </div>

      <div className="flex w-full items-center justify-center gap-5">
        <div
          className={`${user.role === "admin" || user.role === "manager" ? "flex" : "hidden"} flex-col`}
        >
          <label className="text-xs ">Select User</label>
          <Dropdown
            value={selectUser}
            onChange={(e) => {
              setPage(1);
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
            className={`h-10 w-72 rounded  border border-gray-400 text-gray-800 `}
          />
        </div>
        <label className="flex flex-col">
          <span className="text-xs">Pick Time Range</span>
          <Calendar
            className="h-10 w-72 rounded  border border-gray-400 text-gray-800 "
            value={dates}
            onChange={(e) => setDates(e.value)}
            selectionMode="range"
            readOnlyInput
            hideOnRangeSelection
            showButtonBar
            showIcon
          />
        </label>
      </div>
      <div className="mt-10 flex w-full justify-between">
        <div>
          Total Spending $
          {smsPvas.data?.data
            .reduce((prev, current) => {
              return prev + current.price;
            }, 0)
            .toFixed(3)}
        </div>
        <div>{smsPvas.isLoading && "loading..."}</div>
      </div>
      <div className="mt-1 w-full overflow-auto">
        <table className="w-max min-w-full border">
          <thead>
            <tr className="bg-gray-300">
              <th>Account</th>
              <th>Date</th>
              <th>Phone Number</th>
              <th>Spending</th>
              <th>Service</th>
            </tr>
          </thead>
          <tbody>
            {smsPvas.data?.data.map((sms) => {
              const country = countries.find(
                (c) => c.code.toLowerCase() === sms.country.toLowerCase(),
              );
              const service = services.find((s) => s.code === sms.serviceCode);

              return (
                <tr key={sms.id} className="h-16">
                  <td>
                    {" "}
                    <section className="flex items-center gap-2 px-2">
                      <div className="relative h-10 w-10 rounded-lg ">
                        <Image
                          src={sms.user.image}
                          layout="fill"
                          alt="user image"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold leading-none">
                          {sms.user.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {sms.user.email}
                        </span>
                      </div>
                    </section>
                  </td>
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
                      <div className="flex items-center justify-center">
                        <div className="relative h-5 w-5 overflow-hidden">
                          <Image
                            src={`/image/flags/1x1/${country?.code}.svg`}
                            fill
                            alt="flag"
                            className="object-contain"
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {country?.countryCode}
                        </span>
                      </div>
                      {sms.phoneNumber}
                    </div>
                  </td>
                  <td>${sms.price}</td>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SmsPvaHistory;
