"use client"

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock } from "lucide-react";
import { IconFolder } from "@tabler/icons-react";
import Link from "next/link";

interface TabNavigationProps {
  hasAtlassian: boolean;
}

export function TabNavigation({ hasAtlassian }: TabNavigationProps) {
  return (
    <TabsList>
      <Link href="/projects?tab=standalone">
        <TabsTrigger value="standalone">
          <IconFolder className="h-4 w-4 mr-1.5" />
          Standalone Projects
        </TabsTrigger>
      </Link>
      <Link href="/projects?tab=jira" className={!hasAtlassian ? "pointer-events-none" : ""}>
        <TabsTrigger value="jira" disabled={!hasAtlassian}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="h-4 w-4 mr-1.5">
            <path d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.848 20.848 20.848V19.977A3.98 3.98 0 00108.023 16zm0 0" fill="currentColor" />
            <path d="M85.121 39.04H38.902c0 11.519 9.325 20.847 20.844 20.847h8.504v8.226c0 11.52 9.328 20.848 20.848 20.848V43.016a3.983 3.983 0 00-3.977-3.977zm0 0" fill="currentColor" />
            <path d="M62.219 62.078H16c0 11.524 9.324 20.848 20.848 20.848h8.5v8.23c0 11.52 9.328 20.844 20.847 20.844V66.059a3.984 3.984 0 00-3.976-3.98zm0 0" fill="currentColor" />
          </svg>
          Jira Projects
          {!hasAtlassian && <Lock className="ml-2 h-3 w-3" />}
        </TabsTrigger>
      </Link>
    </TabsList>
  );
}
