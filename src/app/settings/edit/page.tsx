import { EditProfileForm } from "@/app/me/_components/edit-profile-form";

export default function EditProfilePage() {
  return (
    <div className="mx-auto max-w-xl pt-10 pb-24 md:pb-32">
      <h1 className="mb-6 text-2xl font-bold">Editar perfil</h1>
      <EditProfileForm />
    </div>
  );
}
