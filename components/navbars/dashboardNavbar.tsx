import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import React, { useState } from "react";
import { BiCaretDown, BiCaretUp } from "react-icons/bi";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaWallet } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";
import { useGetTimezone, useGetUser, useSetTimezone } from "../../react-query";
import { timezones } from "../../data/timezones";
import { GetImpersonateUser } from "../../services/admin/user";
import ImpersonateNavBar from "./impersonateNavBar";
import ThemeToggle from "../common/ThemeToggle";
import Image from "next/image";

function DashboardNavbar({
  setTriggerSidebar,
}: {
  setTriggerSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [triggerAccountMenu, setTriggerAccountMenu] = useState(false);
  const user = useGetUser();
  const { data: timezone } = useGetTimezone();
  const setTimezone = useSetTimezone();
  const impersonateUser = useQuery({
    queryKey: ["user-impersonate"],
    queryFn: () => {
      const cookies = parseCookies();
      const impersonate_access_token = cookies.impersonate_access_token;
      if (!impersonate_access_token) return;
      return GetImpersonateUser({ impersonate_access_token });
    },
  });
  const points = user.data?.oxyclick_points ?? 0;
  const holdingPoints = user.data?.pending_points ?? 0;
  const signOut = () => {
    destroyCookie(null, "access_token", { path: "/" });
    queryClient.removeQueries();

    router.push({
      pathname: "/auth/sign-in",
    });
  };
  return (
    <nav className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-line bg-surface pl-4 font-Poppins md:h-16 md:pl-5">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => {
            setTriggerSidebar((prev) => {
              return !prev;
            });
          }}
          className="flex items-center justify-center text-3xl text-fg transition hover:text-main-color md:text-4xl"
        >
          <IoMenu invaild-click-outside="true" />
        </button>

        <Link
          href="/"
          className="relative ml-2 hidden h-9 w-20 overflow-hidden rounded-full bg-white md:block md:h-10 md:w-40" // logo needs a white pill in both themes — theme-audit-ignore
        >
          <Image
            src="/faviconFull.png"
            fill
            className="object-contain"
            alt="favicon"
          />
        </Link>
      </div>
      {impersonateUser.data && (
        <ImpersonateNavBar impersonateUser={impersonateUser} />
      )}

      <ul className="relative flex h-full w-max items-center justify-end gap-2 pr-2 text-sm font-semibold">
        <li
          onMouseEnter={() => setTriggerAccountMenu(() => true)}
          onMouseLeave={() => setTriggerAccountMenu(() => false)}
          className="relative flex cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-full bg-surface p-1.5 transition duration-100 hover:bg-hover md:p-2"
        >
          {user && (
            <div className="flex w-max items-center justify-center gap-2">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-line-strong bg-panel-raised md:h-10 md:w-10">
                <Image
                  src={user.data?.image ?? ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw"
                  alt="user image picture"
                />
              </div>
              <span className="hidden text-fg md:block">
                {user?.data?.name}
              </span>
              <div className="text-fg">
                {triggerAccountMenu ? <BiCaretUp /> : <BiCaretDown />}
              </div>
            </div>
          )}

          {triggerAccountMenu && (
            <div className="absolute right-0 top-12 z-50 flex w-64 flex-col gap-2 rounded-xl border border-line bg-surface p-3 text-fg shadow-xl md:top-14 md:w-72">
              {user.data?.partner.isShowWallet && (
                <Link
                  href={"/account-billing"}
                  className="group flex w-full items-center gap-3 rounded-xl border border-line-strong bg-panel-raised px-3 py-2.5 transition hover:border-main-color hover:bg-main-color/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="rounded-full border border-line-strong bg-surface p-2">
                    <FaWallet className="text-base text-main-color" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">
                      Wallet
                    </span>
                    <span className="truncate text-sm font-semibold text-fg">
                      {holdingPoints !== 0 && (
                        <>
                          <span className="text-fg-subtle">
                            {(holdingPoints / 100).toFixed(2)}
                          </span>{" "}
                          /{" "}
                        </>
                      )}
                      {(points / 100).toFixed(2)} $
                    </span>
                  </div>
                  <BsPlusCircleFill className="shrink-0 text-lg text-main-color" />
                </Link>
              )}

              <label className="flex w-full flex-col gap-1.5 px-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">
                  Timezone
                </span>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-9 w-full rounded-lg border border-line-strong bg-surface px-2.5 text-xs text-fg focus:border-main-color focus:outline-none focus:ring-1 focus:ring-main-color"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz} className="bg-surface text-fg">
                      {tz}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex w-full flex-col gap-1.5 px-0.5">
                <span className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">
                  Theme
                </span>
                <ThemeToggle />
              </div>

              <div className="my-0.5 h-px w-full bg-line" />

              <ul className="flex w-full flex-col gap-0.5 text-sm font-medium">
                <Link
                  href={"/account-history"}
                  className="w-full rounded-lg px-2.5 py-2 capitalize transition hover:bg-hover hover:text-main-color"
                >
                  Account history
                </Link>
                <Link
                  href={"/account-setting"}
                  className="w-full rounded-lg px-2.5 py-2 capitalize transition hover:bg-hover hover:text-main-color"
                >
                  Account settings
                </Link>
                <Link
                  href={"/account/devices"}
                  className="w-full rounded-lg px-2.5 py-2 transition hover:bg-hover hover:text-main-color"
                >
                  Trusted Devices
                </Link>
                <li
                  onClick={signOut}
                  className="w-full rounded-lg px-2.5 py-2 transition hover:bg-hover hover:text-main-color"
                >
                  Sign Out
                </li>
              </ul>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default DashboardNavbar;
