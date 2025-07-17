import { cookies } from "next/headers";

import { getCurrentUser } from "@/app/auth/actions";
import { MobileProvider } from "@/hooks/use-mobile";
import { UserProvider } from "@/hooks/use-user";

const ServerProviders = async ({ children }: { children: React.ReactNode }) => {
  const [currentUser, cookieStore] = await Promise.all([
    getCurrentUser(),
    cookies(),
  ]);

  const mobileState = cookieStore.get("isMobile")?.value === "true";

  return (
    <MobileProvider initialMobileState={mobileState}>
      <UserProvider initialUserData={currentUser}>{children}</UserProvider>
    </MobileProvider>
  );
};

export default ServerProviders;
