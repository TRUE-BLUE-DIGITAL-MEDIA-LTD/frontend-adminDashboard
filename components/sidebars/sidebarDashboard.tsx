import React, { useEffect, useState, forwardRef } from "react";
import { User } from "../../models";
import Image from "next/image";
import { MenuSidebar, menusSidebar } from "../../data/menus";
import { useRouter } from "next/router";
import Link from "next/link";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import { Popover } from "@headlessui/react";
import SidbarList from "./SidbarList";

const SidebarDashboard = forwardRef<HTMLUListElement, { user: User }>(
  ({ user }, ref) => {
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
      <ul
        ref={ref}
        className="fixed left-0 top-0 z-40 hidden h-screen w-80 flex-col gap-3 overflow-hidden bg-gray-700 pt-20 md:flex "
      >
        {menusSidebar.map((list, index) => {
          if (user?.role === "partner" && (index == 2 || index == 3)) {
            return null;
          } else if (user?.role === "manager" && index == 2) {
            return null;
          }

          return (
            <SidbarList
              key={index}
              list={list as MenuSidebar}
              user={user}
              isSelect={currentMenuIndex === index}
            />
          );
        })}
      </ul>
    );
  },
);

export default SidebarDashboard;
