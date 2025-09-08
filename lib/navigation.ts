import {
  IconCalendar,
  IconDashboard,
  IconFolder,
  IconListDetails,
  type Icon, // Use type Icon for better type safety and to avoid importing TablerIconsProps
} from "@tabler/icons-react";

export type NavItem = {
  pageTitle: string;
  title: string;
  url: string;
  icon: Icon;
};

export const navOptions: NavItem[] = [
  { pageTitle: "Dashboard", title: "Dashboard", url: "/dashboard", icon: IconDashboard, },
  { pageTitle: "Manage Projects And Compliance", title: "Projects", url: "/projects", icon: IconFolder, },
  { pageTitle: "Schedule Testcase Generation", title: "Scheduler", url: "/scheduler", icon: IconCalendar, },
  { pageTitle: "Track Testcase Progress", title: "Testcase", url: "/testcase", icon: IconListDetails, }
];
