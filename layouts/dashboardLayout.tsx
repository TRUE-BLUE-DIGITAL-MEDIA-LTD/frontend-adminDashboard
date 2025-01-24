import { Fragment, useEffect, useRef, useState } from "react";
import SpinLoading from "../components/loadings/spinLoading";
import { TawkInterface, User } from "../models";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import DashboardNavbar from "../components/navbars/dashboardNavbar";
import SidebarDashboard from "../components/sidebars/sidebarDashboard";
import { menusSidebar } from "../data/menus";
import { useRouter } from "next/router";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import Link from "next/link";
import AnnoucementShow from "../components/Annoucement/AnnoucementShow";
import { useGetLatestAnnouncement } from "../react-query";
import useClickOutside from "../hooks/useClickOutside";

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [loadingChat, setLoadingChat] = useState(false);
  const tawkMessengerRef = useRef<TawkInterface>();
  const [triggerSidebar, setTriggerSidebar] = useState<boolean>(false);
  const annoucement = useGetLatestAnnouncement();
  const divRef = useRef<HTMLUListElement>(null);
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
  useClickOutside(divRef, () => {
    setTriggerSidebar(() => false);
  });
  return (
    <>
      {loadingChat && (
        <div className="fixed bottom-0  right-0 z-50 ">
          <SpinLoading />
        </div>
      )}
      {user && (
        <TawkMessengerReact
          onBeforeLoad={onBeforeLoad}
          onLoad={onLoad}
          ref={tawkMessengerRef}
          propertyId={process.env.NEXT_PUBLIC_PROPERTY_ID}
          widgetId={process.env.NEXT_PUBLIC_WIDGET_ID}
        />
      )}

      {annoucement.data && <AnnoucementShow announcement={annoucement.data} />}
      <DashboardNavbar setTriggerSidebar={setTriggerSidebar} user={user} />
      {triggerSidebar && <SidebarDashboard user={user} ref={divRef} />}
      {children}
    </>
  );
}
