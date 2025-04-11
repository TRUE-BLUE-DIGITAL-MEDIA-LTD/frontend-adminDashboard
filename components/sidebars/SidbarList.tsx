import React from "react";
import { MenuSidebar } from "../../data/menus";
import Link from "next/link";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import { User } from "../../models";

type Props = {
  isSelect: boolean;
  list: MenuSidebar;
  user: User;
};
function SidbarList({ isSelect, list, user }: Props) {
  const [trigger, setTrigger] = React.useState(false);
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
          className={`ml-5 flex flex-col gap-2 overflow-auto bg-gray-600 transition duration-100  lg:max-h-52 2xl:max-h-60 ${trigger ? " visible translate-y-0 " : " invisible -translate-y-14"}`}
        >
          {list.childs.map((child, index) => {
            if (
              user.role === "partner" &&
              (child.title === "Payslip Generator" ||
                child.title === "Website Builder")
            ) {
              return null;
            }

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
