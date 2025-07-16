"use client";

import { IconSearch } from "@tabler/icons-react";

import type { UploadWithDetails } from "@/lib/types";

interface ResultCardProps {
  upload: UploadWithDetails;
  onSelect: (title: string) => void;
}

const ResultCard = ({ upload, onSelect }: ResultCardProps) => {
  return (
    <button
      className="group/result relative h-12 text-left"
      onClick={() => onSelect(upload.title)}
    >
      <div className="flex items-center space-x-4">
        <IconSearch className="text-base-content/60 size-5 opacity-50" />
        <div>
          <h3 className="card-title group-hover/result:text-neutral-content line-clamp-2 text-sm transition-colors">
            {upload.title}
          </h3>
          <p className="text-content-muted group-hover/result:text-base-content text-xs transition-colors">
            {upload.game.name}
          </p>
        </div>
      </div>
      <div className="bg-base-300 rounded-box absolute -inset-x-3 -inset-y-1 -z-1 scale-y-50 opacity-0 transition group-hover/result:scale-y-100 group-hover/result:opacity-100"></div>
    </button>
  );
};

export default ResultCard;
