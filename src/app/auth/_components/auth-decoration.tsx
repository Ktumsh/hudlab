const AuthDecoration = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 mask-radial-from-0 mask-radial-at-center"
      style={{
        width: 768,
        height: 768,
        backgroundImage: `
        linear-gradient(to right, var(--color-border-muted) 1px, transparent 1px),
        linear-gradient(to bottom, var(--color-border-muted) 1px, transparent 1px)
      `,
        backgroundSize: "48px 48px",
        borderRadius: "16px",
      }}
    />
  );
};

export default AuthDecoration;
