"use client"

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { syncAtlassianResource } from "@/app/(main)/projects/actions/sync-actions";
import { toast } from "sonner";

export function SyncHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    const shouldSync = searchParams.get("sync") === "true";
    if (shouldSync && !hasRun.current) {
      hasRun.current = true;
      syncAtlassianResource().then(() => {
        toast.success("Atlassian resources synced successfully!");
        router.replace("/integrations/atlassian");
      });
    }
  }, [searchParams, router]);

  return null;
}
