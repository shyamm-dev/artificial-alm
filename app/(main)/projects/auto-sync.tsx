"use client"

import { useEffect, useRef } from "react";
import { syncAtlassianResource } from "./actions/sync-actions";

export function AutoSync({ shouldSync }: { shouldSync: boolean }) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (shouldSync && !hasRun.current) {
      hasRun.current = true;
      syncAtlassianResource();
    }
  }, [shouldSync]);

  return null;
}
