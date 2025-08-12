import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/hooks/use-auth";
import { FilterProvider } from "@/hooks/use-filters";
import { IsSelfProfileProvider } from "@/hooks/use-is-self-profile";
import { LastSessionProvider } from "@/hooks/use-last-session";
import { MobileProvider } from "@/hooks/use-mobile";
import { UserProvider } from "@/hooks/use-user";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <MobileProvider>
      <AuthProvider>
        <UserProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="black"
            enableSystem={false}
          >
            <LastSessionProvider>
              <FilterProvider>
                <IsSelfProfileProvider>{children}</IsSelfProfileProvider>
              </FilterProvider>
            </LastSessionProvider>
          </ThemeProvider>
        </UserProvider>
      </AuthProvider>
    </MobileProvider>
  );
};

export default Providers;
