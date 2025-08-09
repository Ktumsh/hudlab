"use client";

import Image from "next/image";

import type { SearchSuggestion } from "@/lib/types";

interface SuggestionCardProps {
  suggestion: SearchSuggestion;
  onSelect: (title: string) => void;
}

const SuggestionCard = ({ suggestion, onSelect }: SuggestionCardProps) => {
  return (
    <button
      className="group/suggestion card bg-base-200 hover:bg-base-300 text-left shadow-sm transition-colors"
      onClick={() => onSelect(suggestion.title)}
    >
      <figure>
        <Image
          src={suggestion.imageUrl || "/placeholder.svg"}
          alt={suggestion.title}
          width={150}
          height={150}
          className="h-36 w-full object-cover transition group-hover/suggestion:scale-105 group-hover/suggestion:contrast-125"
        />
      </figure>
      <div className="card-body p-4">
        <h3 className="card-title line-clamp-2 text-sm">{suggestion.title}</h3>
        <p className="text-base-content/60 text-xs">{suggestion.category}</p>
      </div>
    </button>
  );
};

export default SuggestionCard;
