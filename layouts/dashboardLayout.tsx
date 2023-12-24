import { useRef, useState } from "react";
import SpinLoading from "../components/loadings/spinLoading";
import { TawkInterface, User } from "../models";
import TawkMessengerReact from "@tawk.to/tawk-messenger-react";
import DashboardNavbar from "../components/navbars/dashboardNavbar";

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [loadingChat, setLoadingChat] = useState(false);
  const tawkMessengerRef = useRef<TawkInterface>();
  const onLoad = () => {
    setLoadingChat(() => false);
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

  return (
    <>
      {loadingChat && (
        <div className="fixed bottom-0  right-0 z-50 ">
          <SpinLoading />
        </div>
      )}
      {/* <TawkMessengerReact
        onBeforeLoad={onBeforeLoad}
        onLoad={onLoad}
        ref={tawkMessengerRef}
        propertyId={process.env.NEXT_PUBLIC_PROPERTY_ID}
        widgetId={process.env.NEXT_PUBLIC_WIDGET_ID}
      /> */}
      <DashboardNavbar user={user} />
      <main>{children}</main>
    </>
  );
}
