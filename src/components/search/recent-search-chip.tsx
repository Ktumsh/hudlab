"use client";

import { IconX } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentSearchChipProps {
  query: string;
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
}

const RecentSearchChip = ({
  query,
  onSelect,
  onRemove,
}: RecentSearchChipProps) => {
  return (
    <Badge
      variant="outline"
      className="bg-base-200 badge-lg btn pr-1 font-normal"
      onClick={() => onSelect(query)}
    >
      {query}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(query);
        }}
        className="size-4! p-0 hover:bg-transparent"
      >
        <IconX />
      </Button>
    </Badge>
  );
};

export default RecentSearchChip;
