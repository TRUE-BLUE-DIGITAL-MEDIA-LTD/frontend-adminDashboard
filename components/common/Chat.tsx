import { useEffect } from "react";
import { User } from "../../models";

interface TawkToChatProps {
  user: User;
}

const TawkToChat = ({ user }: TawkToChatProps) => {
  const TAWK_TO_PROPERTY_ID = "65547c8d958be55aeaafc283";
  const TAWK_TO_WIDGET_ID = "1hf90d2im";

  useEffect(() => {
    if (window.origin.includes("localhost:")) return;
    if (window.innerWidth < 768) return; // Skip for mobile

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_TO_PROPERTY_ID}/${TAWK_TO_WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
    script.onload = () => {
      // Add a small delay to allow Tawk_API to fully initialize
      setTimeout(() => {
        if (window.Tawk_API) {
          window.Tawk_API.setAttributes(
            {
              name: `${user.name} `,
              email: user.email,
              userid: user.id,
              phone: user.role,
              provider: user.provider,
            },
            function (error) {
              console.error("Tawk setAttributes Error:", error);
            },
          );
        } else {
          console.error("Tawk_API still not available after script load.");
        }
      }, 3000);
    };

    return () => {
      document.body.removeChild(script);
      const tawkIframe = document.getElementById("tawkto-container");
      if (tawkIframe) {
        tawkIframe.remove();
      }
    };
  }, []);

  return null;
};

export default TawkToChat;
