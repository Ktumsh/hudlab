"use client";

import { IconSelector } from "@tabler/icons-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TagsFilterProps {
  selectedTags: string[];
  availableTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagsFilter({
  selectedTags,
  availableTags,
  onChange,
}: TagsFilterProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex items-center">
      <span className="text-content-muted flex-1 text-sm">Etiquetas</span>
      <DropdownMenu>
        <DropdownMenuTrigger className="input h-10 min-w-48 flex-1 cursor-pointer">
          {selectedTags.length > 0
            ? `Seleccionadas (${selectedTags.length})`
            : "Seleccionar"}
          {selectedTags.length === 0 && (
            <IconSelector className="text-content-muted ms-auto size-4 opacity-50" />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent className="scrollbar-sm max-h-96" align="end">
          {availableTags.map((tag) => (
            <DropdownMenuItem
              key={tag}
              className="flex items-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTag(tag);
              }}
            >
              <Checkbox
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              />
              <span className="ml-2">{tag}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
