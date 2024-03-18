import { useEffect, useRef, useState } from "react";
import SpinLoading from "../components/loadings/spinLoading";
import { TawkInterface, User } from "../models";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import DashboardNavbar from "../components/navbars/dashboardNavbar";
import SidebarDashboard from "../components/sidebars/sidebarDashboard";
import { menusSidebar } from "../data/menus";
import { useRouter } from "next/router";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import Link from "next/link";

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const router = useRouter();
  const [loadingChat, setLoadingChat] = useState(false);
  const tawkMessengerRef = useRef<TawkInterface>();
  const [currentMenuIndex, setCurrentMenuIndex] = useState<any>();
  const [triggerMiniMenu, setTriggerMiniMenu] = useState(false);
  const [triggerSidebar, setTriggerSidebar] = useState<boolean>(false);
  const pathname = router.pathname; // e.g. "/classroom/setting"
  const lastRoute = pathname.split("/").pop();
  const onLoad = () => {
    setLoadingChat(() => false);
    if (JSON.stringify(tawkMessengerRef.current) === "{}") return;
    tawkMessengerRef.current?.minimize();
    tawkMessengerRef.current?.setAttributes({
      name: user.name,
      store: user.email,
      hash: user.id,
    });
  };
  const onBeforeLoad = () => {
    setLoadingChat(() => true);
  };

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
    <>
      {loadingChat && (
        <div className="fixed bottom-0  right-0 z-50 ">
          <SpinLoading />
        </div>
      )}
      <TawkMessengerReact
        onBeforeLoad={onBeforeLoad}
        onLoad={onLoad}
        ref={tawkMessengerRef}
        propertyId={process.env.NEXT_PUBLIC_PROPERTY_ID}
        widgetId={process.env.NEXT_PUBLIC_WIDGET_ID}
      />
      <ul
        className={` fixed bottom-0 left-0 right-0 top-0 z-40 m-auto flex 
        h-screen w-screen flex-col gap-5 bg-gray-800 p-10 pt-20 transition
         duration-150 md:hidden ${triggerMiniMenu ? "visible translate-y-0" : "invisible hidden -translate-y-14"}`}
      >
        {menusSidebar.map((list, index) => {
          if (user?.role !== "admin" && (index == 2 || index == 3)) {
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
                onClick={() => {
                  if (list.childs) {
                    list.trigger = !list.trigger;
                  } else {
                    setTriggerMiniMenu(() => false);
                  }
                }}
                className="relative z-20 flex w-full items-center justify-start gap-2 p-3 text-lg text-white hover:bg-gray-800 md:text-sm xl:text-lg"
                href={list.childs ? "#" : list.url}
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
                          onClick={() => setTriggerMiniMenu(() => false)}
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
      <DashboardNavbar
        setTriggerSidebar={setTriggerSidebar}
        user={user}
        setTriggerMiniMenu={setTriggerMiniMenu}
      />

      <div className="flex">
        {triggerSidebar && <SidebarDashboard user={user} />}
        {children}
      </div>
    </>
  );
}
