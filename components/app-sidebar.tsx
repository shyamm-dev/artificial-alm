import {
  IconRobot,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Suspense } from "react";
import { hasAtlassianAccount } from "@/lib/check-atlassian-account";

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const hasAtlassian = await hasAtlassianAccount();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a>
                <IconRobot className="!size-5" />
                <span className="text-base font-semibold">Artificial ALM.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain hasAtlassian={hasAtlassian} />
      </SidebarContent>
      <SidebarFooter>
        <Suspense>
          <NavUser />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  )
}
