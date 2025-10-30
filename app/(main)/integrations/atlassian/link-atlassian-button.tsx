"use client"

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { syncAtlassianResource } from "@/app/(main)/projects/actions/sync-actions";
import { toast } from "sonner";

export function LinkAtlassianButton({ userId, hasAtlassian }: { userId: string; hasAtlassian: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldSync, setShouldSync] = useState(false);

  useEffect(() => {
    if (shouldSync && hasAtlassian) {
      syncAtlassianResource().then(() => {
        toast.success("Atlassian resources synced successfully!");
        setShouldSync(false);
      });
    }
  }, [shouldSync, hasAtlassian]);

  const handleLink = async () => {
    setIsLoading(true);
    await authClient.signIn.social({ 
      provider: "atlassian", 
      callbackURL: "/integrations/atlassian" 
    });
    setShouldSync(true);
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
