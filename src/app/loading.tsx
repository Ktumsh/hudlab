import Logo from "@/components/logo";

export default function Loading() {
  return (
    <div className="bg-base-100 fixed inset-0 z-999 grid h-screen w-screen place-content-center">
      <Logo width={200} height={200} className="size-24" />
    </div>
  );
}
