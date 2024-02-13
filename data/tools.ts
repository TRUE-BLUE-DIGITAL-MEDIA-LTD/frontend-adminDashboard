import { IconType } from "react-icons";
import { BsFillSignpost2Fill } from "react-icons/bs";
import { MdDataExploration } from "react-icons/md";

interface ToolsData {
  title: string;
  icon: IconType;
  description: string;
}
export const toolsData: ToolsData[] = [
  {
    title: "Partners' Perfomance",
    icon: MdDataExploration,
    description:
      "Check the perfomance of your partners in a specific date range!",
  },
  {
    title: "Postcode",
    icon: BsFillSignpost2Fill,
    description: "Look up for postcode in any country around the world!",
  },
];
