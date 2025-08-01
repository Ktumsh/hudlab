"use client";

import { IconBookmarks, IconPlus } from "@tabler/icons-react";
import { Suspense } from "react";
import useSWR from "swr";

import CollectionGrid from "./_components/collection-grid";
import CollectionsSkeleton from "./_components/collections-skeleton";
import CreateCollectionForm from "./_components/create-collection-form";

import type { CollectionPreview } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { fetcher } from "@/lib";

export default function CollectionsPage() {
  const { user } = useAuth();

  // Obtener colecciones del usuario
  const { data: userCollections = [] } = useSWR<CollectionPreview[]>(
    user?.id ? `/api/user-collections/${user.id}` : null,
    fetcher,
  );

  // Obtener colecciones públicas
  const { data: publicCollections = [] } = useSWR<CollectionPreview[]>(
    "/api/public-collections?limit=24",
    fetcher,
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
      {user && userCollections.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">Mis Colecciones</h2>
          <Suspense fallback={<CollectionsSkeleton count={4} />}>
            <CollectionGrid collections={userCollections} />
          </Suspense>
        </section>
      )}

      {/* Colecciones Destacadas */}
      {publicCollections.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">
            {user ? "Colecciones Destacadas" : "Explora Colecciones"}
          </h2>
          <Suspense fallback={<CollectionsSkeleton count={8} />}>
            <CollectionGrid collections={publicCollections} />
          </Suspense>
        </section>
      )}

      {/* Estado vacío para usuarios sin colecciones */}
      {user && userCollections.length === 0 && (
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

      {/* Estado para usuarios no autenticados sin colecciones públicas */}
      {!user && publicCollections.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-base-content/60">
            No hay colecciones públicas disponibles en este momento.
          </p>
        </div>
      )}
    </main>
  );
}
