import { redirect } from "next/navigation";

import { auth } from "../auth";
import ForgotPasswordForm from "./forgot-password-form";

export default async function ForgotPassword() {
  const session = await auth();

  if (session?.user?.id) redirect("/feed");

  return <ForgotPasswordForm />;
}
