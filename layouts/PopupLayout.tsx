import { useEffect, type ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  onClose: () => void;
};

function PopupLayout({ children, onClose }: LayoutProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "initial";
    };
  }, []);
  return (
    <section className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen items-center justify-center">
      {children}
      <footer
        onClick={() => {
          if (confirm("Are you sure?")) {
            document.body.style.overflow = "auto";
            onClose();
          }
        }}
        className="fixed bottom-0 left-0 right-0  top-0 -z-10 m-auto h-screen w-screen bg-black/50"
      />
    </section>
  );
}

export default PopupLayout;
