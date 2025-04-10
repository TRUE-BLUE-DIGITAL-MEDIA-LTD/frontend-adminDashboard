import { BiSolidCategory } from "react-icons/bi";
import { BsTools } from "react-icons/bs";
import { FcCustomerSupport } from "react-icons/fc";
import {
  MdAdminPanelSettings,
  MdEmail,
  MdOutlineDomain,
  MdWeb,
} from "react-icons/md";

export const menusSidebar = [
  { title: "Landing Pages", url: "/", icon: MdWeb },
  { title: "Domain Library", url: "/domain", icon: MdOutlineDomain },
  { title: "Submissions", url: "/customer", icon: FcCustomerSupport },
  {
    title: "Control Center",
    url: "/manage-account",
    icon: MdAdminPanelSettings,
  },
  {
    title: "Oxy Tools",
    url: "/tools",
    icon: BsTools,
    childs: [
      { title: "Partners Performance", params: "partners-performance" },
      { title: "SMS Online", params: "sms-online" },
      { title: "Oxy PVA", params: "sms-pva" },
      { title: "Oxy Pool", params: "sms-pool" },
      { title: "Oxy SMS", params: "sms-etms" },
      { title: "Postcode", params: "postcode" },
      {
        title: "Website Builder",
        url: "https://sitestudio.oxyclick.com",
        params: "",
      },
      { title: "Payslip Generator", params: "payslip" },
    ] as const,
  },
] as const;

// get type from array
export type MenuSidebar = (typeof menusSidebar)[number] & {
  childs?: { title: string; params?: string; url?: string }[];
};

export type OxyClickTools =
  (typeof menusSidebar)[4]["childs"][number]["params"];
