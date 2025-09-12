import { db } from "@/db/drizzle";
import { atlassianResource } from "@/db/schema/atlassian-resource-schema";
import { AtlassianResourceWithProjects } from "@/data-access-layer/types";
import { stripUndefined, transformResource, atlassianResourceInsertSchema } from "@/db/helper/sync-helpers";

export function upsertAtlassianResource(apiResource: AtlassianResourceWithProjects) {
  const parsedResource = stripUndefined(atlassianResourceInsertSchema.parse(transformResource(apiResource)));
  return db.insert(atlassianResource)
    .values(parsedResource)
    .onConflictDoUpdate({ target: atlassianResource.cloudId, set: parsedResource });
}
