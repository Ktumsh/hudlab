import { redirect } from "next/navigation";

import { auth } from "../auth";
import SignupForm from "./signup-form";

export default async function SignupPage() {
  const session = await auth();

  if (session?.user?.id) redirect("/feed");

  return <SignupForm />;
}
