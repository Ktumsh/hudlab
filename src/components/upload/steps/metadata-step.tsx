"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft } from "@tabler/icons-react";
import { useCallback } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import useSWR from "swr";

import type { Game } from "@/lib/types";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import GameSearch from "@/components/upload/game-search";
import HashtagExtractor from "@/components/upload/hashtag-extractor";
import { formatToCapitalize } from "@/lib";
import { fetcher } from "@/lib/fetcher";
import { createUploadSchema, CreateUploadFormData } from "@/lib/form-schemas";
import { translateUploadType } from "@/lib/upload-types-mapping";

interface UploadType {
  id: string;
  name: string;
  description?: string;
}

interface UploadTypesResponse {
  success: boolean;
  uploadTypes: UploadType[];
}

interface MetadataStepProps {
  selectedGame: Game | null;
  isProcessing: boolean;
  onGameSelect: (game: Game) => void;
  onTagsChange: (tags: string[]) => void;
  onSubmit: (data: CreateUploadFormData) => void;
  onPrevious: () => void;
}

export default function MetadataStep({
  selectedGame,
  isProcessing,
  onGameSelect,
  onTagsChange,
  onSubmit,
  onPrevious,
}: MetadataStepProps) {
  // Obtener tipos de upload desde la API
  const { data: uploadTypesData, error: uploadTypesError } =
    useSWR<UploadTypesResponse>("/api/upload-types", fetcher);

  const uploadTypes = uploadTypesData?.uploadTypes || [];
  const isLoadingTypes = !uploadTypesData && !uploadTypesError;

  const form = useForm<CreateUploadFormData>({
    resolver: zodResolver(createUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      gameId: selectedGame?.id || "",
      type: "",
      tags: "",
    },
  });

  const { handleSubmit, control } = form;

  // Memoize the onTagsChange callback to prevent unnecessary re-renders
  const handleTagsChange = useCallback(
    (tags: string[]) => {
      onTagsChange(tags);
    },
    [onTagsChange],
  );

  const onError = useCallback((errors: FieldErrors<CreateUploadFormData>) => {
    console.error("Form errors:", errors);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  maxLength={150}
                  placeholder="Título de tu HUD"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <HashtagExtractor
                  text={field.value || ""}
                  onTextChange={field.onChange}
                  onHashtagsChange={handleTagsChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="gameId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Juego</FormLabel>
                <FormControl>
                  <GameSearch
                    onGameSelect={(game) => {
                      onGameSelect(game);
                      field.onChange(game.id);
                    }}
                    selectedGame={selectedGame}
                  />
                </FormControl>
                <FormDescription>
                  ¿A qué juego pertenece este HUD?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoadingTypes}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <div>
                        {field.value
                          ? translateUploadType(
                              formatToCapitalize(
                                uploadTypes.find((t) => t.name === field.value)
                                  ?.name || "",
                              ),
                            )
                          : isLoadingTypes
                            ? "Cargando tipos..."
                            : "Selecciona un tipo"}
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent side="top">
                    <ScrollArea className="h-80">
                      {uploadTypes.map((type) => (
                        <SelectItem
                          key={type.id}
                          value={type.name}
                          className="h-auto"
                        >
                          <div className="flex flex-col items-start justify-center space-y-1">
                            <span>
                              {translateUploadType(
                                formatToCapitalize(type.name),
                              )}
                            </span>
                            {type.description && (
                              <p className="text-base-content/60 text-xs">
                                {type.description}
                              </p>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <Button type="button" size="icon-lg" onClick={onPrevious}>
            <IconArrowLeft className="size-5" />
            <span className="sr-only">Atrás</span>
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isProcessing || isLoadingTypes}
          >
            {isProcessing ? (
              <>
                <Loader className="mx-0 size-4" />
                Creando
              </>
            ) : (
              "Crear y publicar"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
