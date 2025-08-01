"use client";

import { IconSearch, IconX } from "@tabler/icons-react";
import { useState } from "react";

import type { UserSearchResult } from "@/lib/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSimpleSearchDebounce } from "@/hooks/use-simple-debounce";
import { useUserSearch } from "@/hooks/use-user-search";
import { formatDisplayName } from "@/lib";

interface CollaboratorSelectorProps {
  selectedCollaborators: string[];
  onCollaboratorsChange: (collaborators: string[]) => void;
}

const CollaboratorSelector = ({
  selectedCollaborators,
  onCollaboratorsChange,
}: CollaboratorSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useSimpleSearchDebounce(searchQuery, 300);

  const { users, isLoading } = useUserSearch(debouncedSearchQuery);

  const [collaborators, setCollaborators] = useState<UserSearchResult[]>([]);

  const handleAddCollaborator = (user: UserSearchResult) => {
    if (!selectedCollaborators.includes(user.id)) {
      const updatedCollaborators = [...selectedCollaborators, user.id];
      const updatedCollaboratorObjects = [...collaborators, user];

      onCollaboratorsChange(updatedCollaborators);
      setCollaborators(updatedCollaboratorObjects);
      setSearchQuery("");
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    const updatedCollaborators = selectedCollaborators.filter(
      (id) => id !== userId,
    );
    const updatedCollaboratorObjects = collaborators.filter(
      (user) => user.id !== userId,
    );

    onCollaboratorsChange(updatedCollaborators);
    setCollaborators(updatedCollaboratorObjects);
  };

  // Filtrar usuarios que ya están agregados
  const filteredUsers = users.filter(
    (user) => !selectedCollaborators.includes(user.id),
  );

  return (
    <div className="space-y-3">
      <Label>Agregar colaboradores</Label>

      {/* Buscador */}
      <div className="relative">
        <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Resultados de búsqueda */}
      {debouncedSearchQuery && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Buscando...</p>
          ) : filteredUsers.length > 0 ? (
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {formatDisplayName(user.displayName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddCollaborator(user)}
                  >
                    Agregar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No se encontraron usuarios
            </p>
          )}
        </div>
      )}

      {/* Colaboradores agregados */}
      {collaborators.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Colaboradores ({collaborators.length})
          </p>
          <div className="space-y-1">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="bg-muted/30 flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={collaborator.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {formatDisplayName(
                        collaborator.displayName || collaborator.username,
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {collaborator.displayName || collaborator.username}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      @{collaborator.username}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveCollaborator(collaborator.id)}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorSelector;
