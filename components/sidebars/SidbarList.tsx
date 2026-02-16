import Link from "next/link";
import React from "react";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import { MenuSidebar } from "../../data/menus";
import { useGetUser } from "../../react-query";

type Props = {
  isSelect: boolean;
  list: MenuSidebar;
};
function SidbarList({ isSelect, list }: Props) {
  const user = useGetUser().data;
  const [trigger, setTrigger] = React.useState(false);
  if (!user) return null;
  return (
    <li
      onClick={() => setTrigger(!trigger)}
      className={`hover:text-main-color ${
        isSelect ? "text-main-color" : "text-white"
      } text-sm  transition duration-150   xl:text-lg`}
    >
      <Link
        style={{ pointerEvents: list?.childs ? "none" : "auto" }}
        className="relative z-20 flex w-full items-center justify-start gap-2 p-3 text-sm text-white hover:bg-gray-800 xl:text-lg"
        href={list.url}
      >
        <span className="flex w-full items-center justify-start gap-2">
          <list.icon />
          {list.title}
        </span>

        {list.childs && (
          <div className="flex w-full justify-end">
            <IoMdArrowDropdownCircle />
          </div>
        )}
      </Link>
      {list.childs && (
        <ul
          className={`ml-5 flex max-h-72 flex-col gap-2 overflow-auto bg-gray-600 transition duration-100  lg:max-h-52 2xl:max-h-60 ${trigger ? " visible translate-y-0 " : " invisible -translate-y-14"}`}
        >
          {list.childs
            .filter((menu) => {
              if (user.role === "admin") {
                return true;
              }
              if (menu.title === "SMS Report") {
                return false;
              }
              if (
                user.role === "partner" &&
                (menu.title === "Payslip Generator" ||
                  menu.title === "Website Builder")
              ) {
                return false;
              }

              if (
                user.partner.isAllowUsingSMSPOOL === false &&
                menu.title === "Oxy Pool"
              ) {
                return false;
              }

              if (
                user.partner.isAllowUsingSmsBower === false &&
                menu.title === "Oxy Bow"
              ) {
                return false;
              }

              if (
                user.partner.isAllowUsingSmsBower === false &&
                menu.title === "Oxy Bow"
              ) {
                return false;
              }

              if (
                user.partner.isAllowUsingSMSPVA === false &&
                menu.title === "Oxy PVA"
              ) {
                return false;
              }

              if (
                user.partner.isAllowUsingSMS_Daisy === false &&
                menu.title === "Oxy Day"
              ) {
                return false;
              }

              if (
                user.partner.isAllowUsingSMS_Pinverify === false &&
                menu.title === "Oxy Pin"
              ) {
                return false;
              }

              if (
                user.partner.isAllowUsingSMS_TEXTVERIFIED === false &&
                menu.title === "Oxy Text"
              ) {
                return false;
              }

              if (
                !user.partner.isAllowCloudPhone &&
                menu.title === "Cloud Phone"
              ) {
                return false;
              }

              if (!user.partner.isAllowOxySms && menu.title === "Oxy SMS") {
                return false;
              }

              return true;
            })
            .map((child, index) => {
              return (
                <li
                  key={index}
                  className={`hover:text-main-color ${
                    isSelect ? "text-main-color" : "text-white"
                  } text-sm  transition duration-150 active:scale-105 xl:text-lg`}
                >
                  <Link
                    className="flex w-full items-center justify-start gap-2 p-3 text-sm text-white hover:bg-gray-800 xl:text-lg"
                    href={
                      child.title === "Website Builder"
                        ? child.url
                        : list.url + `?option=${child.params}`
                    }
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
}

export default SidbarList;
