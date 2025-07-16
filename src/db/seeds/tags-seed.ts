import { tags } from "@/db/schema";

import { db } from "../db";
import "dotenv/config";
import { TAGS } from "../local/tags";

async function seedTags() {
  for (const tagName of TAGS) {
    await db.insert(tags).values({ name: tagName }).onConflictDoNothing();
  }
  console.log("✅ Tags insertados");
}

seedTags();
