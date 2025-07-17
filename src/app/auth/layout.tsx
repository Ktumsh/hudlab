import AuthHeader from "./_components/auth-header";
import { SignupFormProvider } from "./_hooks/use-signup-form";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignupFormProvider>
      <main className="relative min-h-dvh overflow-hidden px-4 py-12 md:px-8 md:pt-24">
        <div className="relative z-10 mx-auto flex w-full flex-col gap-8 sm:max-w-90">
          <AuthHeader />
          {children}
        </div>
      </main>
    </SignupFormProvider>
  );
}
