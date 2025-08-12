"use client";

import { useFollowedCollections } from "./_hooks/use-followed-collections";
import CollectionGrid from "../../components/collections/collection-grid";
import CollectionsSkeleton from "../../components/collections/collections-skeleton";

import { usePublicCollections } from "@/app/collections/_hooks/use-public-collections";
import { useAuth } from "@/hooks/use-auth";

const PublicCollections = () => {
  const { user } = useAuth();

  const { publicCollections, isLoading: loadingPublic } =
    usePublicCollections();

  const { followed } = useFollowedCollections();

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
        </div>
      </div>
      {/* Colecciones Seguidas */}
      {user && followed && followed.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">Colecciones Seguidas</h2>
          <div className="space-y-8">
            <CollectionGrid collections={followed} />
          </div>
        </section>
      )}
      {/* Colecciones Destacadas */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">Colecciones Destacadas</h2>
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
    </main>
  );
};

export default PublicCollections;
