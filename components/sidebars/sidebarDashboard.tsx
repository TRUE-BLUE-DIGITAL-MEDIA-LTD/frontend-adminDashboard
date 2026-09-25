import { useRouter } from "next/router";
import { forwardRef, useMemo } from "react";
import { MenuSidebar, menusSidebar } from "../../data/menus";
import { Partner, User } from "../../models";
import SidbarList from "./SidbarList";

function isMenuVisible(
  menu: (typeof menusSidebar)[number],
  user: User & { partner: Partner },
) {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "partner" && menu.title === "Control Center") {
    return false;
  }
  if (
    (user.role === "manager" || user.role === "partner") &&
    menu.title === "Submissions"
  ) {
    return false;
  }

  if (
    !user.partner.isAllowManagePartner &&
    menu.title === "Control Center"
  ) {
    return false;
  }

  if (
    !user.partner.isAllowLandingPageManage &&
    menu.title === "Landing Pages"
  ) {
    return false;
  }

  if (
    !user.partner.isAllowDomainManage &&
    menu.title === "Domains Library"
  ) {
    return false;
  }

  return true;
}

function withFilteredChildren(
  menu: (typeof menusSidebar)[number],
  user: User & { partner: Partner },
) {
  if (menu.title === "Oxy Tools" && menu.childs) {
    return {
      ...menu,
      childs: menu.childs.filter((child) => {
        if (
          !user.partner.isAllowUsingSmsBerry &&
          child.title === "Oxy Berry"
        ) {
          return false;
        }
        if (
          !user.partner.isAllowUsingSmsGetatext &&
          child.title === "OxyGT"
        ) {
          return false;
        }
        return true;
      }),
    };
  }
  return menu;
}

/** Match current path to a menu url (supports nested routes like /domain/[id]). */
function menuMatchesPath(menuUrl: string, pathname: string): boolean {
  if (menuUrl === "/") {
    return (
      pathname === "/" ||
      pathname.startsWith("/landingPages") ||
      pathname.startsWith("/landingpage")
    );
  }
  return pathname === menuUrl || pathname.startsWith(`${menuUrl}/`);
}

const SidebarDashboard = forwardRef<
  HTMLUListElement,
  { user: User & { partner: Partner } }
>(({ user }, ref) => {
  const router = useRouter();
  const pathname = router.pathname;

  const visibleMenus = useMemo(
    () =>
      menusSidebar
        .filter((menu) => isMenuVisible(menu, user))
        .map((menu) => withFilteredChildren(menu, user)),
    [user],
  );

  const currentMenuIndex = useMemo(() => {
    const index = visibleMenus.findIndex((menu) =>
      menuMatchesPath(menu.url, pathname),
    );
    return index === -1 ? undefined : index;
  }, [visibleMenus, pathname]);

  return (
    <ul
      ref={ref}
      className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col gap-0.5 overflow-y-auto overflow-x-hidden border-r border-line bg-surface py-16 pl-1 pr-1.5"
    >
      {visibleMenus.map((list, index) => {
        return (
          <SidbarList
            key={list.url}
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
