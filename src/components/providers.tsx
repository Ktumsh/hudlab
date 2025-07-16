import ClientProviders from "./client-providers";
import ServerProviders from "./server-providers";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ServerProviders>
      <ClientProviders>{children}</ClientProviders>
    </ServerProviders>
  );
};

export default Providers;
