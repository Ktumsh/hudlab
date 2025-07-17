import { redirect } from "next/navigation";

import { getUploadByPublicId } from "@/db/querys/uploads-querys";

import UploadDetails from "./_components/upload-details";

import type { Metadata } from "next";

interface UploadPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  props: UploadPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  const upload = await getUploadByPublicId(id);
  return {
    title: upload?.title ?? "HUD compartido",
  };
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { id } = await params;

  if (!id) redirect("/feed");

  const upload = await getUploadByPublicId(id);

  if (!upload) redirect("/feed");

  return <UploadDetails upload={upload} />;
}
