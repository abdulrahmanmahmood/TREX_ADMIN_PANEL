import { HomeIcon } from "lucide-react";

interface menuItem {
  name: string;
  id: number;
  url: string;
  icon: React.ReactNode;
}

export const menuItems: menuItem[] = [
  {
    name: "Home",
    id: 1,
    url: "/",
    icon: <HomeIcon />,
  },
  {
    name: "Partenter Registration",
    id: 2,
    url: "/partner-registration",
    icon: <HomeIcon />,
  },
  {
    name: "Chapters",
    icon: <HomeIcon />,
    id: 3,
    url: "/chapters",
  },
  {
    name: "Products",
    icon: <HomeIcon />,
    id: 5,
    url: "/products",
  },
  {
    name: "Measurments",
    icon: <HomeIcon />,
    id: 6,
    url: "/measurments",
  },
  {
    name: "Agreements",
    icon: <HomeIcon />,
    id: 7,
    url: "/agreement",
  },
  {
    name: "countries",
    icon: <HomeIcon />,
    id: 8,
    url: "/country",
  },
];
