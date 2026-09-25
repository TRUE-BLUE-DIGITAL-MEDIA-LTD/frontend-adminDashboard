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
      className={`mx-1.5 text-xs transition duration-150 ${
        isSelect ? "text-main-color" : "text-fg-muted"
      }`}
    >
      <Link
        style={{ pointerEvents: list?.childs ? "none" : "auto" }}
        className={`relative z-20 flex w-full items-center justify-start gap-2 rounded-r-md border-l-2 px-2.5 py-1.5 text-xs transition ${
          isSelect
            ? "border-main-color bg-main-color/10 text-main-color"
            : "border-transparent text-fg-muted hover:border-line-strong hover:bg-hover hover:text-main-color"
        }`}
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
          className={`ml-3 flex max-h-56 flex-col gap-0.5 overflow-auto border-l-2 border-main-color/60 bg-surface transition duration-100 lg:max-h-48 ${trigger ? " visible translate-y-0 " : " invisible -translate-y-14"}`}
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
                user.partner.isAllowUsingSmsBerry === false &&
                menu.title === "Oxy Berry"
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
                user.partner.isAllowUsingSMS_Pinverify === false &&
                menu.title === "Oxy Pin"
              ) {
                return false;
              }

              if (
                user.partner.isAllowUsingSMS_Virtualsms !== true &&
                menu.title === "Oxy V"
              ) {
                return false;
              }

              if (
                user.partner.isAllowUsingSmsBulk !== true &&
                menu.title === "Oxy Bulk"
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
                  className="text-xs text-fg-muted transition duration-150 hover:text-main-color active:scale-105"
                >
                  <Link
                    className="flex w-full items-center justify-start gap-2 rounded-r-md border-l-2 border-transparent px-2.5 py-1.5 text-xs text-fg-muted transition hover:border-main-color/50 hover:bg-main-color/5 hover:text-main-color"
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
