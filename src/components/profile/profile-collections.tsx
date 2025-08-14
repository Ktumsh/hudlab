"use client";

import { IconPlus, IconStar } from "@tabler/icons-react";

import { useProfileCollections } from "../../hooks/profile/use-profile-collections";
import CollectionItem from "../collections/collection-item";
import Loader from "../loader";
import ProfileUsername from "./profile-username";
import { Separator } from "../ui/separator";

import { useInvitations } from "@/app/collections/_hooks/use-invitations";
import CollectionGrid from "@/components/collections/collection-grid";
import CollectionsSkeleton from "@/components/collections/collections-skeleton";
import CreateCollectionForm from "@/components/collections/create-collection-form";
import { Button } from "@/components/ui/button";
import { useIsSelfProfile } from "@/hooks/use-is-self-profile";

interface ProfileCollectionsProps {
  username: string;
}

const ProfileCollections = ({ username }: ProfileCollectionsProps) => {
  const { collections, refresh, isLoading } = useProfileCollections(username);
  const isSelf = useIsSelfProfile();

  const {
    invitations: invites,
    accept,
    reject,
    isAccepting,
    isRejecting,
  } = useInvitations();

  const handleAccept = async (invitationId: string) => {
    await accept(invitationId);
    refresh();
  };

  const handleReject = async (invitationId: string) => {
    await reject(invitationId);
    refresh();
  };

  return (
    <div className="space-y-6">
      {isSelf && invites.length > 0 && (
        <>
          <h3 className="mb-3 text-sm font-semibold">Invitaciones</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
            {invites.map((inv) => (
              <CollectionItem
                key={inv.id}
                isInvitation={true}
                collectionInvitation={inv}
              >
                <div className="flex items-center gap-2">
                  <Button
                    disabled={isRejecting(inv.id)}
                    className="flex-1"
                    onClick={() => handleReject(inv.id)}
                  >
                    {isRejecting(inv.id) ? (
                      <Loader className="size-4" />
                    ) : (
                      "Rechazar"
                    )}
                  </Button>
                  <Button
                    variant="primary"
                    disabled={isAccepting(inv.id)}
                    className="flex-1"
                    onClick={() => handleAccept(inv.id)}
                  >
                    {isAccepting(inv.id) ? (
                      <Loader className="size-4" />
                    ) : (
                      "Aceptar"
                    )}
                  </Button>
                </div>
              </CollectionItem>
            ))}
          </div>
        </>
      )}
      {collections && collections?.length > 0 && invites.length > 0 && (
        <Separator />
      )}
      {isLoading ? (
        <CollectionsSkeleton count={14} />
      ) : collections && collections?.length > 0 ? (
        <CollectionGrid collections={collections} showEditButton={isSelf} />
      ) : (
        <>
          {isSelf && invites.length === 0 && (
            <div className="py-16 text-center">
              <div className="bg-base-200 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                <IconStar className="text-base-content/40 h-10 w-10" />
              </div>
              <h3 className="text-lg font-semibold">
                Crea tu primera colección
              </h3>
              <p className="text-base-content/60 mt-2">
                Organiza tus HUDs favoritos en colecciones temáticas
              </p>
              <div className="mt-6">
                <CreateCollectionForm>
                  <Button>
                    <IconPlus />
                    Nueva Colección
                  </Button>
                </CreateCollectionForm>
              </div>
            </div>
          )}
          {!isSelf && (
            <div className="py-16 text-center">
              <div className="bg-base-200 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                <IconStar className="text-base-content/40 h-10 w-10" />
              </div>
              <h3 className="text-lg font-semibold">
                No hay colecciones públicas
              </h3>
              <p className="text-base-content/60 mt-2">
                <ProfileUsername username={username} /> aún no ha creado
                colecciones públicas.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileCollections;
