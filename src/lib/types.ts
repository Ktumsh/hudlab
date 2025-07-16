import type { Game, Profile, Upload } from "@/db/schema";

export interface ApplicationError extends Error {
  info: string;
  status: number;
}

export interface User {
  id: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: Date;
  likes: number;
  liked: boolean;
  replies?: Comment[];
  replyTo?: string;
}

export interface CommentWithRelations {
  id: string;
  content: string;
  createdAt: Date | string | null;
  replyTo?: string | null;
  profile: Profile;
  likes: { profileId: string }[];
  replies: CommentWithRelations[];
}

export interface UploadWithFullDetails extends Upload {
  profile: Profile;
  game: Game;
  comments: CommentWithRelations[];
}

export interface UploadWithDetails extends Upload {
  profile: Profile;
  game: Game;
}

export interface UploadWithProfileAndAspect extends UploadWithDetails {
  aspectRatio: string;
}
export interface FilterState {
  searchText: string;
  tags: string[];
  platform: string | undefined;
  releaseYear: string | number | undefined;
  isFavorited: boolean;
  sortBy: "newest" | "oldest" | "popular";
}

export interface FilterOptions {
  tags: string[];
  platforms: string[];
  releaseYears: number[];
}

export interface FilterChangeEvent {
  filters: FilterState;
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
}

export interface SearchSuggestion {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  publicId: number;
}
