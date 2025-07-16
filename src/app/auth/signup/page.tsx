import { redirect } from "next/navigation";

import { auth } from "../auth";
import SignupForm from "./_components/signup-form";

export default async function SignupPage() {
  const session = await auth();

  if (session?.user) redirect("/");

  return <SignupForm />;
}
