import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import React, { useState } from "react";
import { BiCaretDown, BiCaretUp } from "react-icons/bi";
import { IoMenu } from "react-icons/io5";
import { User } from "../../models";
import { GetImpersonateUser } from "../../services/admin/user";
import ImpersonateNavBar from "./impersonateNavBar";
import { MdMoney, MdPlusOne } from "react-icons/md";
import { FaCoins, FaWallet } from "react-icons/fa6";
import { BsPlusCircleFill } from "react-icons/bs";
import { useGetUser } from "../../react-query";

function DashboardNavbar({
  setTriggerSidebar,
}: {
  setTriggerSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [triggerAccountMenu, setTriggerAccountMenu] = useState(false);
  const user = useGetUser();
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

      <ul className="relative flex h-16 w-max  items-center justify-end  text-sm font-semibold lg:gap-5 xl:gap-10">
        <Link
          href={"/account-billing"}
          className="group mr-52  flex h-10 w-max items-center justify-center gap-3 rounded-lg bg-white px-4 py-1 text-icon-color transition-all hover:bg-icon-color hover:text-white  active:scale-105"
        >
          <div className="rounded-full bg-blue-100 p-2">
            <FaWallet className="text-lg text-blue-600" />
          </div>
          <div className="relative flex flex-col">
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
            <span className="text-[10px]  font-normal">Available Balance</span>
          </div>
          <BsPlusCircleFill className="text-xl" />
        </Link>

        <li
          onMouseEnter={() => setTriggerAccountMenu(() => true)}
          onMouseLeave={() => setTriggerAccountMenu(() => false)}
          className={`
          absolute right-2 top-0  flex cursor-pointer select-none  flex-col
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
              <span className="text-white">{user?.data?.name}</span>
              <div className="text-white">
                {triggerAccountMenu ? <BiCaretUp /> : <BiCaretDown />}
              </div>
            </div>
          )}

          {triggerAccountMenu && (
            <ul className="   flex w-40 flex-col items-start justify-center gap-2 text-white ">
              <Link
                href={"/account-history"}
                className="w-full hover:font-bold"
              >
                account history
              </Link>
              <Link
                href={"/account-setting"}
                className="w-full hover:font-bold"
              >
                account settings
              </Link>
              <li onClick={signOut} className="w-full hover:font-bold">
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
