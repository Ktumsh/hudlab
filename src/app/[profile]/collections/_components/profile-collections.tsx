"use client";

import { IconPlus, IconStar } from "@tabler/icons-react";

import { useProfileCollections } from "../../_hooks/use-profile-collections";

import CollectionGrid from "@/app/collections/_components/collection-grid";
import CollectionsSkeleton from "@/app/collections/_components/collections-skeleton";
import CreateCollectionForm from "@/app/collections/_components/create-collection-form";
import { Button } from "@/components/ui/button";

interface ProfileCollectionsProps {
  username: string;
  isSelf: boolean;
}

const ProfileCollections = ({ username, isSelf }: ProfileCollectionsProps) => {
  const { collections, isLoading } = useProfileCollections(username);

  return (
    <>
      {isLoading ? (
        <CollectionsSkeleton count={14} />
      ) : collections && collections?.length > 0 ? (
        <CollectionGrid collections={collections} />
      ) : (
        <div className="py-16 text-center">
          <div className="bg-base-200 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <IconStar className="text-base-content/40 h-10 w-10" />
          </div>
          {isSelf ? (
            <>
              <h3 className="text-lg font-semibold">
                Crea tu primera colección
              </h3>
              <p className="text-base-content/60 mt-2">
                Organiza tus uploads favoritos en colecciones temáticas
              </p>
              <div className="mt-6">
                <CreateCollectionForm>
                  <Button>
                    <IconPlus />
                    Nueva Colección
                  </Button>
                </CreateCollectionForm>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">
                No hay colecciones públicas
              </h3>
              <p className="text-base-content/60 mt-2">
                {username} aún no ha creado colecciones públicas.
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ProfileCollections;
