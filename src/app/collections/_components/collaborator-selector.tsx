"use client";

import { IconMoodSad, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import type { UserSearchResult } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/user-avatar";
import { useSimpleSearchDebounce } from "@/hooks/use-debounce";
import { useUserSearch } from "@/hooks/use-user-search";

interface CollaboratorSelectorProps {
  selectedCollaborators: string[];
  onCollaboratorsChange: (
    collaborators: string[],
    collaboratorUsers?: UserSearchResult[],
  ) => void;
  initialCollaborators?: UserSearchResult[];
  hideLabel?: boolean;
  excludeIds?: string[];
}

const CollaboratorSelector = ({
  selectedCollaborators,
  onCollaboratorsChange,
  initialCollaborators = [],
  hideLabel = false,
  excludeIds = [],
}: CollaboratorSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useSimpleSearchDebounce(searchQuery, 300);

  const { users, isLoading: isLoadingUsers } =
    useUserSearch(debouncedSearchQuery);

  // Estado local de los colaboradores visibles en el listado "Ya invitados"
  const [collaboratorUsers, setCollaboratorUsers] =
    useState<UserSearchResult[]>(initialCollaborators);

  useEffect(() => {
    if (initialCollaborators && initialCollaborators.length > 0) {
      setCollaboratorUsers(initialCollaborators);
    }
  }, [initialCollaborators]);

  const handleAddCollaborator = (user: UserSearchResult) => {
    if (
      !selectedCollaborators.includes(user.id) &&
      !excludeIds.includes(user.id)
    ) {
      const updatedCollaborators = [...selectedCollaborators, user.id];
      const updatedCollaboratorObjects = [...collaboratorUsers, user];

      onCollaboratorsChange(updatedCollaborators, updatedCollaboratorObjects);
      setCollaboratorUsers(updatedCollaboratorObjects);
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    const updatedCollaborators = selectedCollaborators.filter(
      (id) => id !== userId,
    );
    const updatedCollaboratorObjects = collaboratorUsers.filter(
      (user) => user.id !== userId,
    );

    onCollaboratorsChange(updatedCollaborators, updatedCollaboratorObjects);
    setCollaboratorUsers(updatedCollaboratorObjects);
  };

  // Filtrar usuarios que ya están agregados
  const filteredUsers = users.filter(
    (user) =>
      !selectedCollaborators.includes(user.id) && !excludeIds.includes(user.id),
  );

  return (
    <div className="fieldset">
      {!hideLabel && <FormLabel>Agregar colaboradores</FormLabel>}

      {/* Buscador */}
      <div className="relative">
        <IconSearch className="text-content-muted absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Resultados de búsqueda cuando hay término */}
      <div className="space-y-2">
        {((debouncedSearchQuery && filteredUsers.length > 0) ||
          collaboratorUsers.length > 0) && (
          <div className="scrollbar-sm rounded-field max-h-60 overflow-y-auto border">
            {collaboratorUsers.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center gap-3 p-3"
              >
                <UserAvatar profile={collaborator} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {collaborator.displayName || collaborator.username}
                  </p>
                  <p className="text-content-muted truncate text-xs">
                    @{collaborator.username}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleRemoveCollaborator(collaborator.id)}
                >
                  Invitado
                </Button>
              </div>
            ))}
            {debouncedSearchQuery &&
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3">
                  <UserAvatar profile={user} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {user.displayName || user.username}
                    </p>
                    <p className="text-content-muted truncate text-xs">
                      @{user.username}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    outline
                    onClick={() => handleAddCollaborator(user)}
                  >
                    Invitar
                  </Button>
                </div>
              ))}
          </div>
        )}
        {debouncedSearchQuery &&
          filteredUsers.length === 0 &&
          !isLoadingUsers && (
            <div className="rounded-field flex items-center justify-center gap-2 border p-4">
              <p className="text-content-muted text-sm">
                No se encontraron usuarios
              </p>
              <IconMoodSad className="text-content-muted size-5" />
            </div>
          )}
      </div>
    </div>
  );
};

export default CollaboratorSelector;
