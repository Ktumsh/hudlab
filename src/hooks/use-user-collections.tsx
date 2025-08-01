"use client";

import { useCallback } from "react";
import useSWR from "swr";

import { useAuth } from "./use-auth";

import type { CollectionWithItems, CollectionWithUpload } from "@/lib/types";

import { fetcher } from "@/lib";

export function useUserCollections() {
  const { user } = useAuth();

  const {
    data = [],
    isLoading,
    mutate,
  } = useSWR<CollectionWithItems[]>(
    user?.id ? `/api/user-collections/${user.id}?includeItems=true` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      fallbackData: [],
    },
  );

  const refreshCollections = useCallback(() => {
    mutate();
  }, [mutate]);

  /**
   * Verifica si un upload específico está en alguna colección
   */
  const isUploadInCollections = useCallback(
    (uploadId: string) => {
      return data.some(
        (collection) =>
          collection.items?.some((item) => item.uploadId === uploadId) || false,
      );
    },
    [data],
  );

  /**
   * Obtiene las colecciones que contienen un upload específico
   * Retorna en el formato que espera el componente AddToCollectionButton
   */
  const getCollectionsForUpload = useCallback(
    (uploadId: string): CollectionWithUpload[] => {
      return data.map((collection) => ({
        ...collection,
        hasUpload:
          collection.items?.some((item) => item.uploadId === uploadId) || false,
      }));
    },
    [data],
  );

  /**
   * Actualiza el estado local cuando se agrega/quita un upload de una colección (optimistic update)
   */
  const updateOptimisticCollectionStatus = useCallback(
    (collectionId: string, uploadId: string, hasUpload: boolean) => {
      mutate((current: CollectionWithItems[] | undefined) => {
        if (!current) return current;

        return current.map((collection) => {
          if (collection.id === collectionId) {
            const currentItems = collection.items || [];

            if (hasUpload) {
              // Agregar upload si no existe
              const uploadExists = currentItems.some(
                (item) => item.uploadId === uploadId,
              );
              if (!uploadExists) {
                return {
                  ...collection,
                  itemsCount: (collection.itemsCount || 0) + 1,
                  items: [
                    ...currentItems,
                    {
                      id: `temp-${Date.now()}`,
                      uploadId,
                      collectionId,
                      addedAt: new Date(),
                      order: (collection.itemsCount || 0) + 1,
                    },
                  ],
                };
              }
            } else {
              // Remover upload si existe
              const updatedItems = currentItems.filter(
                (item) => item.uploadId !== uploadId,
              );
              return {
                ...collection,
                itemsCount: Math.max(0, (collection.itemsCount || 0) - 1),
                items: updatedItems,
              };
            }
          }
          return collection;
        });
      }, false);
    },
    [mutate],
  );

  return {
    collections: data,
    isLoading,
    refreshCollections,
    isUploadInCollections,
    getCollectionsForUpload,
    updateOptimisticCollectionStatus,
  };
}
