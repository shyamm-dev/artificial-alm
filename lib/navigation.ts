import {
  IconFileText,
  IconFolder,
  IconPlug,
  IconHome,
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
  { title: "Home", url: "/", pageTitle: "Explore Features & Capabilities", icon: IconHome },
  { title: "Projects", url: "/projects", pageTitle: "Manage Projects And Compliance", icon: IconFolder },
  { title: "Generate Testcase", url: "/scheduler", pageTitle: "Schedule And Track Testcase Generation Progress", icon: IconFileText },
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
