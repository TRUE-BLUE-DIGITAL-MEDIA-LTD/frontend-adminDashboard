import React, { useEffect, useState } from "react";
import { User } from "../../models";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { destroyCookie, parseCookies } from "nookies";
import Link from "next/link";
import Image from "next/image";
import { BiCaretDown, BiCaretUp } from "react-icons/bi";
import { IoMenu } from "react-icons/io5";
import { IoMdMenu } from "react-icons/io";
import ImpersonateNavBar from "./impersonateNavBar";
import { GetImpersonateUser } from "../../services/admin/user";

function DashboardNavbar({
  user,
  setTriggerMiniMenu,
  setTriggerSidebar,
}: {
  user: User;
  setTriggerMiniMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setTriggerSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [triggerAccountMenu, setTriggerAccountMenu] = useState(false);
  const impersonateUser = useQuery({
    queryKey: ["user-impersonate"],
    queryFn: () => {
      const cookies = parseCookies();
      const impersonate_access_token = cookies.impersonate_access_token;
      if (!impersonate_access_token) return;
      return GetImpersonateUser({ impersonate_access_token });
    },
  });
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
      <div
        onClick={() => setTriggerMiniMenu((prev) => !prev)}
        className="flex items-center justify-center text-3xl text-white md:hidden"
      >
        <IoMdMenu />
      </div>
      <div className="  flex items-center justify-center gap-2 ">
        <button
          onClick={() => setTriggerSidebar((prev) => !prev)}
          className="hidden items-center justify-center text-4xl text-white md:flex"
        >
          <IoMenu />
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
      <ul className="relative flex h-14  items-center justify-end  text-sm font-semibold lg:gap-5 xl:gap-10">
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
                  src={user.image}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw"
                  alt="user image picture"
                />
              </div>
              <span className="text-white">{user?.name}</span>
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
