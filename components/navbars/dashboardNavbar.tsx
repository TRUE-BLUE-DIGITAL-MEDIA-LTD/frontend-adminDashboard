import React, { useEffect, useState } from "react";
import { User } from "../../models";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { destroyCookie } from "nookies";
import Link from "next/link";
import Image from "next/image";
import { BiCaretDown, BiCaretUp } from "react-icons/bi";

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
    <nav className="w-full absolute bg-white drop-shadow-md font-Poppins top-0 h-20 z-50 flex items-center justify-between ">
      <Link
        href="/"
        className="w-40 h-20 ml-2 relative rounded-r-md overflow-hidden"
      >
        <Image
          src="/faviconFull.png"
          fill
          className="object-contain"
          alt="favicon"
        />
      </Link>
      <ul className="w-max mx-10 flex font-semibold items-center justify-center gap-10">
        {menus.map((list, index) => {
          if (user?.role !== "admin" && (index == 2 || index == 3)) {
            return null;
          }
          return (
            <li
              key={index}
              className={`hover:text-blue-800 ${
                currentMenuIndex === index ? "text-blue-800" : "text-main-color"
              } transition duration-150 active:scale-105`}
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
          } relative hover:ring-2 ring-black rounded-lg 
      transition duration-100 p-2 cursor-pointer select-none flex-col justify-center gap-2 items-center`}
        >
          {user && (
            <div className="flex justify-center items-center gap-2">
              <div className="w-10 h-10 relative overflow-hidden rounded-full bg-slate-300">
                <Image
                  src={user.image}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw"
                  alt="user image picture"
                />
              </div>
              <span>{user?.name}</span>
              <div>{triggerAccountMenu ? <BiCaretUp /> : <BiCaretDown />}</div>
            </div>
          )}
          {triggerAccountMenu && (
            <ul className="w-full flex flex-col justify-center items-start gap-2 ">
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
