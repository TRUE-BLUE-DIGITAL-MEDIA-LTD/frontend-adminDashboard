import { useRouter } from "next/router";
import { forwardRef, useEffect, useState } from "react";
import { MenuSidebar, menusSidebar } from "../../data/menus";
import { Partner, User } from "../../models";
import SidbarList from "./SidbarList";

const SidebarDashboard = forwardRef<
  HTMLUListElement,
  { user: User & { partner: Partner } }
>(({ user }, ref) => {
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
      className="fixed left-0 top-0 z-40  flex h-screen w-80 flex-col gap-3 overflow-hidden bg-gray-700 pt-20 "
    >
      {menusSidebar
        .filter((menu) => {
          if (user.role === "partner" && menu.title === "Control Center") {
            return false;
          }
          if (user.role === "manager" && menu.title === "Submissions") {
            return false;
          }

          if (
            user.role === "manager" &&
            !user.partner.isAllowManagePartner &&
            menu.title === "Control Center"
          ) {
            return false;
          }

          return true;
        })
        .map((list, index) => {
          return (
            <SidbarList
              key={index}
              list={list as MenuSidebar}
              isSelect={currentMenuIndex === index}
            />
          );
        })}
    </ul>
  );
});

SidebarDashboard.displayName = "SidebarDashboard";

export default SidebarDashboard;
