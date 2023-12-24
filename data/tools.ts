import { IconType } from "react-icons";
import { BsFillSignpost2Fill } from "react-icons/bs";

interface ToolsData {
  title: string;
  icon: IconType;
  description: string;
}
export const toolsData: ToolsData[] = [
  {
    title: "postcode",
    icon: BsFillSignpost2Fill,
    description: "look up for postcode in any country around the world!",
  },
];
