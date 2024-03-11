import { BiSolidCategory } from "react-icons/bi";
import { BsTools } from "react-icons/bs";
import {
  MdAdminPanelSettings,
  MdEmail,
  MdOutlineDomain,
  MdWeb,
} from "react-icons/md";

export const menusSidebar = [
  { title: "Categories", url: "/", icon: BiSolidCategory },
  { title: "Landing Pages", url: "/landingPages", icon: MdWeb },
  { title: "Domain", url: "/domain", icon: MdOutlineDomain },
  { title: "Email", url: "/email", icon: MdEmail },
  {
    title: "Account Management",
    url: "/manage-account",
    icon: MdAdminPanelSettings,
  },
  {
    title: "Tools",
    url: "/tools",
    icon: BsTools,
    childs: [
      { title: "Partners' Perfomance", params: "partners-perfomance" },
      { title: "Postcode", params: "postcode" },
    ],
    trigger: false,
  },
];
