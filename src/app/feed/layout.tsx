import FeedGradient from "@/components/feed-gradient";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      {children}
      <FeedGradient />
    </main>
  );
}
