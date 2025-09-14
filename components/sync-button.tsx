"use client";

import { Button } from "@/components/ui/button";
import { IconRefresh, IconLoader2 } from "@tabler/icons-react";
import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { syncAtlassianResource } from "@/app/(main)/projects/actions/sync-actions";
import { toast } from "sonner";

const initialState = {
  message: "",
  success: false,
};

function SyncButtonContent() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="flex items-center gap-2" size="sm" disabled={pending}>
      {pending ? (
        <IconLoader2 className="h-4 w-4 animate-spin" />
      ) : (
        <IconRefresh className="h-4 w-4" />
      )}
      {pending ? "Syncing..." : "Sync Atlassian"}
    </Button>
  );
}

export function SyncButton() {
  const [state, formAction] = useActionState(syncAtlassianResource, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction}>
      <SyncButtonContent />
    </form>
  );
}
