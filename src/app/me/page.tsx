import { redirect } from "next/navigation";

import { getServerAuth } from "@/lib/server-auth";

export default async function MeIndexPage() {
  const session = await getServerAuth();
  if (!session?.user?.username) redirect("/auth/login?next=/me/huds");
  redirect("/me/huds");
}
