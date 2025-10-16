import { useRef, useState } from "react";
import AnnoucementShow from "../components/Annoucement/AnnoucementShow";
import TawkToChat from "../components/common/Chat";
import SpinLoading from "../components/loadings/spinLoading";
import DashboardNavbar from "../components/navbars/dashboardNavbar";
import SidebarDashboard from "../components/sidebars/sidebarDashboard";
import useClickOutside from "../hooks/useClickOutside";
import { User } from "../models";
import { useGetLatestAnnouncement } from "../react-query";

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [loadingChat, setLoadingChat] = useState(false);
  const [triggerSidebar, setTriggerSidebar] = useState<boolean>(false);
  const annoucement = useGetLatestAnnouncement();
  const divRef = useRef<HTMLUListElement>(null);

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
      {user && <TawkToChat user={user} />}

      {annoucement.data && <AnnoucementShow announcement={annoucement.data} />}
      <DashboardNavbar setTriggerSidebar={setTriggerSidebar} />
      {triggerSidebar && <SidebarDashboard user={user} ref={divRef} />}
      {children}
    </>
  );
}
