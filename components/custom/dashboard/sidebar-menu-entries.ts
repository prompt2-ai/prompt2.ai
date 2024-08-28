import {
    Tag,
    Users,
    Settings,
    Bookmark,
    SquarePen,
    LayoutGrid,
    LucideIcon,
    Circle,
    RotateCcwSquareIcon
  } from "lucide-react";
  
  type Submenu = {
    href: string;
    label: string;
    active: boolean;
  };
  
  type Menu = {
    href: string;
    label: string;
    active: boolean;
    icon: LucideIcon
    submenus: Submenu[];
  };
  
  type Group = {
    groupLabel: string;
    menus: Menu[];
  };
  
  export function dashboardMenuEntries(pathname: string): Group[] {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/O",
            label: "Home",
            active: pathname.includes("/O"),
            icon: Circle,
            submenus: [
              {
                href: "/about",
                label: "About",
                active: pathname.includes("/O")
              },
              {
                href: "/documentation",
                label: "Documentation",
                active: pathname.includes("/O")
              }
            ]
          },
          {
            href: "/dashboard",
            label: "Dashboard",
            active: pathname.includes("/dashboard"),
            icon: LayoutGrid,
            submenus: []
          }
        ]
      },
      {
        groupLabel: "Settings",
        menus: [
          {
            href: "/O/profile",
            label: "Profile",
            active: pathname.includes("/O/profile"),
            icon: Users,
            submenus: []
          },
          {
            href: "/O/subscriptions",
            label: "Subscriptions",
            active: pathname.includes("/O/subscriptions"),
            icon: RotateCcwSquareIcon,
            submenus: []
          }
        ]
      }
    ];
  }