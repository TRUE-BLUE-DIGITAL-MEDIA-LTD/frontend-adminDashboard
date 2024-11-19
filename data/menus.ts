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
      { title: "SMS Online", params: "sms" },
      { title: "Oxy SMS", params: "sms-etms" },
      { title: "Postcode", params: "postcode" },
      { title: "Website Builder", url: "https://sitestudio.oxyclick.com" },
      { title: "Payslip Generator", params: "payslip" },
    ],
    trigger: false,
  },
];
