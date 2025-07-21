import type {
  Game,
  Profile,
  Upload,
  User,
  Collection,
  CollectionItem,
  UploadImage,
} from "@/db/schema";

export interface ApplicationError extends Error {
  info: string;
  status: number;
}

export interface UserWithProfile extends User {
  profile: Profile;
}

export interface UserComment {
  id: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  user: UserComment;
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
  images: UploadImage[];
}

export interface UploadWithDetails extends Upload {
  profile: Profile;
  game: Game;
  images: UploadImage[];
}

export interface UploadWithProfileAndAspect extends UploadWithDetails {
  aspectRatio: string;
}

// ─────────────────────────────
// 🗂️ COLLECTION TYPES
// ─────────────────────────────

export interface CollectionWithDetails extends Collection {
  profile: Profile;
  items: CollectionItemWithUpload[];
}

export interface CollectionItemWithUpload extends CollectionItem {
  upload: UploadWithDetails;
}

export interface CollectionPreview extends Collection {
  profile: Profile;
  previewUploads: UploadWithDetails[];
}
export interface FilterState {
  searchText: string;
  tags: string[];
  platform: string | undefined;
  releaseYear: string | number | undefined;
  inMyCollections: boolean;
  sortBy: "newest" | "oldest" | "popular";
}

export interface FilterOptions {
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

export interface UserSearchResult {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}
