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
  { title: "Domains Library", url: "/domain", icon: MdOutlineDomain },
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
      { title: "Performance", params: "partners-performance" },
      { title: "Sales", params: "league-table" },
      { title: "SMS Report", params: "sms-report" },
      { title: "Cloud Phone", params: "cloud-phone" },
      { title: "Oxy PVA", params: "sms-pva" },
      { title: "Oxy Berry", params: "sms-berry" },
      { title: "Oxy Pool", params: "sms-pool" },
      { title: "Oxy Text", params: "sms-textverified" },
      { title: "Oxy Pin", params: "sms-pinverify" },
      { title: "Oxy Day", params: "sms-daisy" },
      { title: "Oxy Bow", params: "sms-bower" },
      { title: "Oxy SMS", params: "sms-etms" },
      {
        title: "Website Builder",
        url: "https://sitestudio.oxyclick.com",
        params: "",
      },
      { title: "Payslip Generator", params: "payslip" },
    ] as const,
  },
] as const;

export type MenuSidebar = (typeof menusSidebar)[number] & {
  childs?: (typeof menusSidebar)[4]["childs"];
};
export type OxyClickTools =
  (typeof menusSidebar)[4]["childs"][number]["params"];
