import { cookies } from "next/headers";

import { MobileProvider } from "@/hooks/use-mobile";

const ServerProviders = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();

  const mobileState = cookieStore.get("isMobile")?.value === "true";

  return (
    <MobileProvider initialMobileState={mobileState}>{children}</MobileProvider>
  );
};

export default ServerProviders;
