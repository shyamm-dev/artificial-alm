"use client";

import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";
import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";

export function SyncButton() {
  const { pending } = useFormStatus();
  const [syncComplete, setSyncComplete] = useState(false);

  useEffect(() => {
    if (!pending && syncComplete) {
      const timer = setTimeout(() => {
        setSyncComplete(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pending, syncComplete]);

  useEffect(() => {
    if (!pending && !syncComplete) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur(); // Remove focus from the button after submission
      }
      setSyncComplete(true);
    }
  }, [pending]);


  return (
    <Button type="submit" className="flex items-center gap-2" disabled={pending}>
      <IconRefresh className="h-4 w-4" />
      {pending ? "Syncing..." : syncComplete ? "Complete!" : "Sync Atlassian"}
    </Button>
  );
}
