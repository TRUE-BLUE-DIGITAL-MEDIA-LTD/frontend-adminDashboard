import React, { useEffect, useState } from "react";
import { User } from "../../models";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { destroyCookie } from "nookies";
import Link from "next/link";
import Image from "next/image";
import { BiCaretDown, BiCaretUp } from "react-icons/bi";
import { IoMenu } from "react-icons/io5";

const menus = [
  { title: "Categories", url: "/" },
  { title: "Landing Pages", url: "/landingPages" },
  { title: "Domain", url: "/domain" },
  { title: "Email", url: "/email" },
  { title: "Account Management", url: "/manage-account" },
  { title: "Tools", url: "/tools" },
];

function DashboardNavbar({ user }: { user: User }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentMenuIndex, setCurrentMenuIndex] = useState<any>();
  const [triggerAccountMenu, setTriggerAccountMenu] = useState(false);
  const pathname = router.pathname; // e.g. "/classroom/setting"
  const lastRoute = pathname.split("/").pop();
  const [triggerMenubar, setTriggerMenubar] = useState(false);
  useEffect(() => {
    if (lastRoute === "") {
      setCurrentMenuIndex(() => 0);
    } else if (lastRoute === "landingPages") {
      setCurrentMenuIndex(() => 1);
    } else if (lastRoute === "domain") {
      setCurrentMenuIndex(() => 2);
    } else if (lastRoute === "email") {
      setCurrentMenuIndex(() => 3);
    } else if (lastRoute === "manage-account") {
      setCurrentMenuIndex(() => 4);
    } else if (lastRoute === "tools") {
      setCurrentMenuIndex(() => 5);
    }
  }, [lastRoute]);

  const signOut = () => {
    destroyCookie(null, "access_token", { path: "/" });
    // queryClient.removeQueries("user");

    router.push({
      pathname: "/auth/sign-in",
    });
  };
  return (
    <div className="">
      <div
        onClick={() => setTriggerMenubar((prev) => !prev)}
        className="fixed left-2 top-2 z-[90] m-auto flex h-max w-max items-center
       justify-center rounded-full bg-icon-color p-3 text-xl text-black md:hidden"
      >
        <IoMenu />
      </div>
      {triggerMenubar && (
        <div
          className="fixed bottom-0  left-0 right-0 top-0 z-[80] m-auto flex h-screen
         w-screen flex-col items-center justify-center bg-icon-color"
        >
          <Link
            href="/"
            className="relative ml-2 h-20 w-40 overflow-hidden rounded-r-md"
          >
            <Image
              src="/faviconFull.png"
              fill
              className="object-contain"
              alt="favicon"
            />
          </Link>

          {menus.map((list, index) => {
            if (user?.role !== "admin" && (index == 2 || index == 3)) {
              return null;
            }
            return (
              <li
                key={index}
                className={`hover:text-blue-800 ${
                  currentMenuIndex === index
                    ? "text-blue-800"
                    : "text-main-color"
                } text-xs transition duration-150 active:scale-105 xl:text-lg`}
              >
                <Link href={list.url}>{list.title}</Link>
              </li>
            );
          })}
          <li
            onMouseEnter={() => setTriggerAccountMenu(() => true)}
            onMouseLeave={() => setTriggerAccountMenu(() => false)}
            className={`flex ${
              triggerAccountMenu && "top-5 bg-white"
            } relative cursor-pointer select-none flex-col 
      items-center justify-center gap-2 rounded-lg p-2 ring-black transition duration-100 hover:ring-2`}
          >
            {user && (
              <div className="flex items-center justify-center gap-2">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-300">
                  <Image
                    src={user.image}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw"
                    alt="user image picture"
                  />
                </div>
                <span>{user?.name}</span>
                <div>
                  {triggerAccountMenu ? <BiCaretUp /> : <BiCaretDown />}
                </div>
              </div>
            )}
            {triggerAccountMenu && (
              <ul className="flex w-40 flex-col items-start justify-center gap-2 ">
                <li onClick={signOut} className="w-full hover:font-bold">
                  Sign Out
                </li>
              </ul>
            )}
          </li>
        </div>
      )}

      <nav
        className="bg fixed top-0  z-50 hidden h-20 w-full items-center justify-between bg-white 
    font-Poppins drop-shadow-md md:flex "
      >
        <Link
          href="/"
          className="relative ml-2 h-20 w-40 overflow-hidden rounded-r-md"
        >
          <Image
            src="/faviconFull.png"
            fill
            className="object-contain"
            alt="favicon"
          />
        </Link>
        <ul className="mx-10 flex w-8/12 items-center justify-between gap-10 text-sm font-semibold">
          {menus.map((list, index) => {
            if (user?.role !== "admin" && (index == 2 || index == 3)) {
              return null;
            }
            return (
              <li
                key={index}
                className={`hover:text-blue-800 ${
                  currentMenuIndex === index
                    ? "text-blue-800"
                    : "text-main-color"
                } text-xs transition duration-150 active:scale-105 xl:text-lg`}
              >
                <Link href={list.url}>{list.title}</Link>
              </li>
            );
          })}
          <li
            onMouseEnter={() => setTriggerAccountMenu(() => true)}
            onMouseLeave={() => setTriggerAccountMenu(() => false)}
            className={`flex ${
              triggerAccountMenu && "top-5 bg-white"
            } relative cursor-pointer select-none flex-col 
      items-center justify-center gap-2 rounded-lg p-2 ring-black transition duration-100 hover:ring-2`}
          >
            {user && (
              <div className="flex items-center justify-center gap-2">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-300">
                  <Image
                    src={user.image}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw"
                    alt="user image picture"
                  />
                </div>
                <span>{user?.name}</span>
                <div>
                  {triggerAccountMenu ? <BiCaretUp /> : <BiCaretDown />}
                </div>
              </div>
            )}
            {triggerAccountMenu && (
              <ul className="flex w-40 flex-col items-start justify-center gap-2 ">
                <li onClick={signOut} className="w-full hover:font-bold">
                  Sign Out
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default DashboardNavbar;
