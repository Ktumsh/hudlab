"use client";

import { IconBookmarks, IconPlus } from "@tabler/icons-react";

import CollectionGrid from "./collection-grid";
import CollectionsSkeleton from "./collections-skeleton";
import CreateCollectionForm from "./create-collection-form";
import { useFollowedCollections } from "../_hooks/use-followed-collections";
import { useInvitations } from "../_hooks/use-invitations";
import { useUserCollectionsPreview } from "../_hooks/use-user-collections-preview";

import { usePublicCollections } from "@/app/collections/_hooks/use-public-collections";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const Collections = () => {
  const { user } = useAuth();

  const { userCollections, isLoading: loadingUserCols } =
    useUserCollectionsPreview();

  const { publicCollections, isLoading: loadingPublic } =
    usePublicCollections();

  const {
    invitations: invites,
    accept,
    reject,
    accepting,
    rejecting,
  } = useInvitations();

  const { followed, isLoading: loadingFollowed } = useFollowedCollections();

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Colecciones</h1>
            <p className="text-base-content/70 mt-1">
              Descubre y organiza colecciones de contenido curado
            </p>
          </div>
          {user && (
            <div className="flex-shrink-0">
              <CreateCollectionForm>
                <Button>
                  <IconPlus />
                  Nueva Colección
                </Button>
              </CreateCollectionForm>
            </div>
          )}
        </div>
      </div>

      {/* Mis Colecciones */}
      {user && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">Mis Colecciones</h2>
          {invites.length > 0 && (
            <div className="mb-6 rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold">Invitaciones</h3>
              <div className="space-y-2">
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-2"
                  >
                    <div>
                      <p className="text-sm">
                        Has sido invitado a colaborar en{" "}
                        <span className="font-medium">
                          {inv.collection.name}
                        </span>{" "}
                        por{" "}
                        {inv.grantedBy.displayName || inv.grantedBy.username}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Permiso: {inv.permission}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => reject(inv.id)}
                        disabled={rejecting}
                      >
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => accept(inv.id)}
                        disabled={accepting}
                      >
                        Aceptar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-8">
            <div>
              <h3 className="mb-3 text-sm font-semibold">Propias</h3>
              {loadingUserCols ? (
                <CollectionsSkeleton count={4} />
              ) : userCollections && userCollections.length > 0 ? (
                <CollectionGrid collections={userCollections} showEditButton />
              ) : (
                <div className="text-base-content/60 py-4 text-sm">
                  Aún no tienes colecciones.
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Seguidas</h3>
              {loadingFollowed ? (
                <CollectionsSkeleton count={4} />
              ) : followed && followed.length > 0 ? (
                <CollectionGrid collections={followed} />
              ) : (
                <div className="text-base-content/60 py-4 text-sm">
                  Aún no sigues colecciones.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Colecciones Destacadas */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">
          {user ? "Colecciones Destacadas" : "Explora Colecciones"}
        </h2>
        {loadingPublic ? (
          <CollectionsSkeleton count={8} />
        ) : publicCollections && publicCollections.length > 0 ? (
          <CollectionGrid collections={publicCollections} />
        ) : (
          <div className="text-base-content/60 py-4 text-sm">
            No hay colecciones públicas disponibles en este momento.
          </div>
        )}
      </section>

      {/* Estado vacío para usuarios sin colecciones con CTA */}
      {user && !loadingUserCols && userCollections?.length === 0 && (
        <div className="py-16 text-center">
          <div className="bg-base-200 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <IconBookmarks className="text-base-content/40 h-10 w-10" />
          </div>
          <h3 className="text-lg font-semibold">Crea tu primera colección</h3>
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
        </div>
      )}
    </main>
  );
};

export default Collections;
