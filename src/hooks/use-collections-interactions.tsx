"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

import { useApiMutation } from "@/lib/use-mutation";

interface UseCollectionsInteractionsOptions {
  uploadId: string;
  onOptimisticUpdate: (collectionId: string, hasUpload: boolean) => void;
  onRefresh: () => void;
}

interface UseCollectionsInteractionsReturn {
  isLoading: boolean;
  handleToggleCollection: (
    collectionId: string,
    currentHasUpload: boolean,
  ) => Promise<void>;
}

export const useCollectionsInteractions = ({
  uploadId,
  onOptimisticUpdate,
  onRefresh,
}: UseCollectionsInteractionsOptions): UseCollectionsInteractionsReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const toggleCollectionMutation = useApiMutation(
    "/api/collections/toggle-upload",
    "POST",
  );

  const handleToggleCollection = useCallback(
    async (collectionId: string, currentHasUpload: boolean) => {
      // Optimistic update a través del hook padre
      onOptimisticUpdate(collectionId, !currentHasUpload);

      setIsLoading(true);

      try {
        const result = (await toggleCollectionMutation.mutateAsync({
          collectionId,
          uploadId,
          hasUpload: !currentHasUpload,
        })) as { success: boolean; collectionName?: string; error?: string };

        if (!result.success) {
          onOptimisticUpdate(collectionId, currentHasUpload);
          console.error("Error toggling collection:", result.error);
        } else {
          // Mostrar toast con el nombre de la colección
          const collectionName = result.collectionName || "la colección";
          toast.success(
            currentHasUpload
              ? `Se quitó de "${collectionName}"`
              : `Se agregó a "${collectionName}"`,
          );
        }
        onRefresh();
      } catch (error) {
        // Revert optimistic update on error
        onOptimisticUpdate(collectionId, currentHasUpload);
        console.error("Error toggling collection:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [uploadId, toggleCollectionMutation, onOptimisticUpdate, onRefresh],
  );

  return {
    isLoading,
    handleToggleCollection,
  };
};
