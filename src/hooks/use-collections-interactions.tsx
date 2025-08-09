"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

import useOptimisticSWRMutation from "@/hooks/use-optimistic-swr-mutation";

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

  const lastPayloadRef = useRef<{
    collectionId: string;
    uploadId: string;
    hasUpload: boolean;
  } | null>(null);

  const { run: runToggleUpload, isMutating } = useOptimisticSWRMutation<{
    success: boolean;
    collectionName?: string;
    error?: string;
  }>("/api/collections/toggle-upload", {
    getBody: () => lastPayloadRef.current,
    onError: (err) => {
      console.error("Error toggling collection:", err);
    },
  });

  const handleToggleCollection = useCallback(
    async (collectionId: string, currentHasUpload: boolean) => {
      // Optimistic update a través del hook padre
      onOptimisticUpdate(collectionId, !currentHasUpload);

      setIsLoading(true);

      try {
        lastPayloadRef.current = {
          collectionId,
          uploadId,
          hasUpload: !currentHasUpload,
        };
        const result = await runToggleUpload();

        if (!result.success) {
          onOptimisticUpdate(collectionId, currentHasUpload);
          console.error("Error toggling collection:", result.error);
        } else {
          const collectionName = result.collectionName || "la colección";
          toast.success(
            currentHasUpload
              ? `Se eliminó de "${collectionName}"`
              : `Se añadió a "${collectionName}"`,
          );
        }
        onRefresh();
      } catch (error) {
        onOptimisticUpdate(collectionId, currentHasUpload);
        console.error("Error toggling collection:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [uploadId, runToggleUpload, onOptimisticUpdate, onRefresh],
  );

  return {
    isLoading: isLoading || isMutating,
    handleToggleCollection,
  };
};
