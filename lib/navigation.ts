import {
  IconCalendar,
  IconFolder,
  IconPlug,
  type Icon,
} from "@tabler/icons-react";

export type NavItem = {
  pageTitle: string;
  title: string;
  url: string;
  icon: Icon;
  isGroup?: boolean;
  items?: NavItem[];
  showStatus?: boolean;
};

export const navOptions: NavItem[] = [
  { title: "Projects", url: "/projects", pageTitle: "Manage Projects And Compliance", icon: IconFolder },
  { title: "Scheduler", url: "/scheduler", pageTitle: "Schedule And Track Testcase Generation", icon: IconCalendar },
  {
    title: "Integrations",
    url: "/integrations",
    pageTitle: "Manage Integrations",
    icon: IconPlug,
    isGroup: true,
    items: [
      { title: "Atlassian", url: "/integrations/atlassian", pageTitle: "Atlassian Integration", icon: IconPlug, showStatus: true },
    ]
  },
];
