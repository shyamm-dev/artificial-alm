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
  { title: "Dashboard", url: "/dashboard", pageTitle: "Dashboard", icon: IconDashboard, },
  { title: "Projects", url: "/projects", pageTitle: "Manage Projects And Compliance", icon: IconFolder, },
  { title: "Scheduler", url: "/scheduler", pageTitle: "Schedule Testcase Generation", icon: IconCalendar, },
  { title: "Testcase", url: "/testcase", pageTitle: "Track Testcase Progress", icon: IconListDetails, }
];
