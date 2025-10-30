"use client"

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function LinkAtlassianButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLink = async () => {
    setIsLoading(true);
    await authClient.linkSocial({ provider: "atlassian", callbackURL: "/integrations/atlassian?sync=true" });
    setIsLoading(false);
  };

  return (
    <Button onClick={handleLink} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="mr-2 h-4 w-4">
            <path d="M108.023 16H61.805c0 11.52 9.324 20.848 20.847 20.848h8.5v8.226c0 11.52 9.328 20.848 20.848 20.848V19.977A3.98 3.98 0 00108.023 16zm0 0" fill="currentColor" />
            <path d="M85.121 39.04H38.902c0 11.519 9.325 20.847 20.844 20.847h8.504v8.226c0 11.52 9.328 20.848 20.848 20.848V43.016a3.983 3.983 0 00-3.977-3.977zm0 0" fill="currentColor" />
            <path d="M62.219 62.078H16c0 11.524 9.324 20.848 20.848 20.848h8.5v8.23c0 11.52 9.328 20.844 20.847 20.844V66.059a3.984 3.984 0 00-3.976-3.98zm0 0" fill="currentColor" />
          </svg>
          Link Atlassian Account
        </>
      )}
    </Button>
  );
}


