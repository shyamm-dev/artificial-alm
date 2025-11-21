"use client"

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { syncAtlassianResource } from "./projects/actions/sync-actions";
import { toast } from "sonner";

export function HomeAutoSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    const shouldSync = searchParams.get("sync") === "atlassian";
    if (shouldSync && !hasRun.current) {
      hasRun.current = true;
      syncAtlassianResource().then((result) => {
        if (result.success) {
          toast.success("Atlassian resources synced successfully!");
        } else {
          toast.error(result.message || "Failed to sync Atlassian resources.");
        }
        router.replace("/");
      });
    }
  }, [searchParams, router]);

  return null;
}
