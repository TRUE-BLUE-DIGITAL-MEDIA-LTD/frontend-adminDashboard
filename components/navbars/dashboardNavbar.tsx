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
    <nav
      className=" sticky top-0  z-50 flex  h-16 w-full items-center justify-between bg-gray-800
    pl-5 font-Poppins drop-shadow-md "
    >
      <div className="  flex items-center justify-center gap-2 ">
        <button
          onClick={() => {
            setTriggerSidebar((prev) => {
              return !prev;
            });
          }}
          className=" flex items-center justify-center text-4xl text-white"
        >
          <IoMenu invaild-click-outside="true" />
        </button>

        <Link
          href="/"
          className="relative ml-2 hidden h-10 w-20 overflow-hidden rounded-lg bg-white md:block md:w-40 "
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

      <ul className="relative flex h-16 w-max items-center justify-end gap-2 pr-2 text-sm font-semibold md:gap-5 lg:gap-10">
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="h-10 rounded-lg border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        {user.data?.partner.isShowWallet && (
          <Link
            href={"/account-billing"}
            className="group flex h-10 w-max items-center justify-center gap-3 rounded-lg bg-white px-4 py-1 text-icon-color transition-all hover:bg-icon-color hover:text-white  active:scale-105"
          >
            <div className="rounded-full bg-blue-100 p-2">
              <FaWallet className="text-lg text-blue-600" />
            </div>
            <div className="relative hidden flex-col md:flex">
              <span className="text relative -bottom-1 text-[1.2rem] font-semibold text-black group-hover:text-white">
                {holdingPoints !== 0 && (
                  <>
                    <span className="text-sm text-gray-500 group-hover:text-white">
                      {(holdingPoints / 100).toFixed(2)}
                    </span>{" "}
                    <span className="text-sm">/</span>{" "}
                  </>
                )}
                {(points / 100).toFixed(2)} $
              </span>
              <span className="text-[10px]  font-normal">
                Available Balance
              </span>
            </div>
            <BsPlusCircleFill className="hidden text-xl md:block" />
          </Link>
        )}

        <li
          onMouseEnter={() => setTriggerAccountMenu(() => true)}
          onMouseLeave={() => setTriggerAccountMenu(() => false)}
          className={`
          relative flex cursor-pointer select-none flex-col
      items-center justify-center gap-2 rounded-lg bg-gray-800 p-2 transition duration-100 `}
        >
          {user && (
            <div className="flex w-max items-center justify-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-300">
                <Image
                  src={user.data?.image ?? ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw"
                  alt="user image picture"
                />
              </div>
              <span className="hidden text-white md:block">
                {user?.data?.name}
              </span>
              <div className="text-white">
                {triggerAccountMenu ? <BiCaretUp /> : <BiCaretDown />}
              </div>
            </div>
          )}

          {triggerAccountMenu && (
            <ul className="absolute right-0 top-14 z-50 flex w-40 flex-col items-start justify-center gap-2 rounded-b-lg bg-gray-800 p-2 text-white ">
              <Link
                href={"/account-history"}
                className="w-full rounded-md p-2 hover:bg-gray-700 hover:font-bold"
              >
                account history
              </Link>
              <Link
                href={"/account-setting"}
                className="w-full rounded-md p-2 hover:bg-gray-700 hover:font-bold"
              >
                account settings
              </Link>
              <li
                onClick={signOut}
                className="w-full rounded-md p-2 hover:bg-gray-700 hover:font-bold"
              >
                Sign Out
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default DashboardNavbar;
