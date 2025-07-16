import { redirect } from "next/navigation";

import { getUploadByPublicId } from "@/db/querys/uploads-querys";

import UploadDetails from "./_components/upload-details";

interface UploadPageProps {
  params: Promise<{ id: string }>;
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { id } = await params;

  if (!id) redirect("/feed");

  const upload = await getUploadByPublicId(id);

  if (!upload) redirect("/feed");

  return <UploadDetails upload={upload} />;
}
