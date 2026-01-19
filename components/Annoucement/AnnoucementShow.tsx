import React, { ReactNode } from "react";
import { Announcement } from "../../models";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";

type Props = {
  announcement: Announcement;
};
function AnnoucementShow({ announcement }: Props) {
  let icon: ReactNode = <FiInfo />;
  switch (announcement.status) {
    case "info":
      icon = <FiInfo />;
      break;
    case "success":
      icon = <FiCheckCircle />;
      break;
    case "warning":
      icon = <FiAlertTriangle />;
      break;
    case "error":
      icon = <FiAlertCircle />;
      break;
  }
  return (
    <div
      className={`fixed bottom-0 z-50 flex h-14 w-full items-center justify-start gap-2 
        ${announcement.status === "info" ? "bg-blue-50" : announcement.status === "success" ? "bg-green-50" : announcement.status === "warning" ? "bg-yellow-50" : "bg-red-50"}
        `}
    >
      <div
        className={`h-full w-3  ${announcement.status === "info" ? "bg-blue-700" : announcement.status === "success" ? "bg-green-700" : announcement.status === "warning" ? "bg-yellow-700" : "bg-red-700"}
        `}
      />
      <div
        className={`flex items-center justify-center ${announcement.status === "info" ? "text-blue-700" : announcement.status === "success" ? "text-green-700" : announcement.status === "warning" ? "text-yellow-700" : "text-red-700"}`}
      >
        {icon}
      </div>
      <h1
        className={`font-semibold ${announcement.status === "info" ? "text-blue-700" : announcement.status === "success" ? "text-green-700" : announcement.status === "warning" ? "text-yellow-700" : "text-red-700"}`}
      >
        {announcement.title}
      </h1>
      <p
        className={`font-normal ${announcement.status === "info" ? "text-blue-500" : announcement.status === "success" ? "text-green-500" : announcement.status === "warning" ? "text-yellow-500" : "text-red-500"}`}
      >
        {announcement.description}
      </p>
    </div>
  );
}

export default AnnoucementShow;
