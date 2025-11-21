"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, X } from "lucide-react";
import Link from "next/link";

export function JiraIntegrationBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('jiraBannerDismissed');
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('jiraBannerDismissed', 'true');
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <span className="font-semibold">Tip:</span> Connect 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="h-4 w-4 inline">
              <path d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.848 20.848 20.848V19.977A3.98 3.98 0 00108.023 16zm0 0" fill="currentColor" />
              <path d="M85.121 39.04H38.902c0 11.519 9.325 20.847 20.844 20.847h8.504v8.226c0 11.52 9.328 20.848 20.848 20.848V43.016a3.983 3.983 0 00-3.977-3.977zm0 0" fill="currentColor" />
              <path d="M62.219 62.078H16c0 11.524 9.324 20.848 20.848 20.848h8.5v8.23c0 11.52 9.328 20.844 20.847 20.844V66.059a3.984 3.984 0 00-3.976-3.98zm0 0" fill="currentColor" />
            </svg>
            Jira for Team Collaboration
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            Link your Atlassian account to sync Jira projects and collaborate with your team.
          </p>
          <Link href="/integrations/atlassian">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Link Account
            </Button>
          </Link>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="shrink-0 h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
