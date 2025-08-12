"use client";

import {
  IconCheck,
  IconMoodSad,
  IconProgress,
  IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";

import type { UserSearchResult, PendingInvitation } from "@/lib/types";

import ProfileUsername from "@/components/profile/profile-username";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/user-avatar";
import { useSimpleSearchDebounce } from "@/hooks/use-debounce";
import { useUserSearch } from "@/hooks/use-user-search";

interface CollaboratorSelectorProps {
  currentCollaborators: UserSearchResult[];
  pendingInvitations?: PendingInvitation[];
  onAdd: (user: UserSearchResult) => Promise<void>;
  onRemove?: (profileId: string) => Promise<void>;
  hideLabel?: boolean;
  excludeUserIds?: string[];
  showAcceptedStatus?: boolean; // Nueva prop para controlar si mostrar "Aceptado"
}

const CollaboratorSelector = ({
  currentCollaborators,
  pendingInvitations = [],
  onAdd,
  onRemove,
  hideLabel = false,
  excludeUserIds = [],
  showAcceptedStatus = true, // Por defecto mostrar "Aceptado"
}: CollaboratorSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useSimpleSearchDebounce(searchQuery, 300);

  const { users, isLoading: isLoadingUsers } =
    useUserSearch(debouncedSearchQuery);

  const handleAddCollaborator = async (user: UserSearchResult) => {
    if (!excludeUserIds.includes(user.id)) {
      await onAdd(user);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (onRemove) {
      await onRemove(userId);
    }
  };

  // Filtrar usuarios que ya están agregados o excluidos
  const filteredUsers = users.filter(
    (user) => !excludeUserIds.includes(user.id),
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
          currentCollaborators.length > 0 ||
          pendingInvitations.length > 0) && (
          <div className="scrollbar-sm rounded-field max-h-60 overflow-y-auto border">
            {/* Colaboradores aceptados */}
            {currentCollaborators.map((collaborator) => (
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
                <div className="flex items-center gap-2">
                  {showAcceptedStatus && (
                    <Button
                      type="button"
                      size="sm"
                      variant="success"
                      outline
                      className="pointer-events-none"
                    >
                      <IconCheck />
                      Aceptado
                    </Button>
                  )}
                  {onRemove && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Invitaciones pendientes */}
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center gap-3 p-3">
                <UserAvatar profile={invitation.profile} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {invitation.profile.displayName ||
                      invitation.profile.username}
                  </p>
                  <ProfileUsername
                    username={invitation.profile.username}
                    className="text-xs"
                    logoClassName="size-4 mr-0.5"
                    logoSize={16}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="warning"
                  outline
                  className="pointer-events-none"
                >
                  <IconProgress />
                  Pendiente
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
