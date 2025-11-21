"use client"

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function LinkAtlassianButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLink = async () => {
    setIsLoading(true);
    await authClient.signIn.social({ 
      provider: "atlassian", 
      callbackURL: "/integrations/atlassian?sync=true" 
    });
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
        "Link Atlassian Account"
      )}
    </Button>
  );
}
