import React, { useEffect, useState } from "react";
import { User } from "../../models";
import Image from "next/image";
import { menusSidebar } from "../../data/menus";
import { useRouter } from "next/router";
import Link from "next/link";
import { IoMdArrowDropdownCircle } from "react-icons/io";

function SidebarDashboard({ user }: { user: User }) {
  const router = useRouter();
  const [currentMenuIndex, setCurrentMenuIndex] = useState<any>();
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

  return (
    <ul className="sticky left-0 top-0 flex h-screen w-60 flex-col gap-3 overflow-hidden bg-gray-700 pt-20 2xl:w-80 ">
      {menusSidebar.map((list, index) => {
        if (user?.role !== "admin" && (index == 3 || index == 4)) {
          return null;
        }
        return (
          <li
            key={index}
            className={`hover:text-main-color ${
              currentMenuIndex === index ? "text-main-color" : "text-white"
            } text-sm  transition duration-150 active:scale-105 xl:text-lg`}
          >
            <Link
              onClick={() => (list.trigger = !list.trigger)}
              className="relative z-20 flex w-full items-center justify-start gap-2 p-3 text-sm text-white hover:bg-gray-800 xl:text-lg"
              href={list.childs ? "#" : list.url}
            >
              <list.icon />
              {list.title}
              {list.childs && (
                <div className="flex w-full justify-end">
                  <IoMdArrowDropdownCircle />
                </div>
              )}
            </Link>
            {list.childs && (
              <ul
                className={`ml-5 flex flex-col gap-2 transition duration-150 ${list.trigger ? " visible translate-y-0 " : " invisible -translate-y-14"}`}
              >
                {list.childs.map((child, index) => {
                  return (
                    <li
                      key={index}
                      className={`hover:text-main-color ${
                        currentMenuIndex === index
                          ? "text-main-color"
                          : "text-white"
                      } text-sm  transition duration-150 active:scale-105 xl:text-lg`}
                    >
                      <Link
                        className="flex w-full items-center justify-start gap-2 p-3 text-sm text-white hover:bg-gray-800 xl:text-lg"
                        href={list.url + `?option=${child.params}`}
                      >
                        {child.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default SidebarDashboard;
