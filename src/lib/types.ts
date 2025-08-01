// ─────────────────────────────
// 🧾 TYPES LOCALES (sin dependencias de DB)
// ─────────────────────────────

export interface User {
  id: string;
  email: string;
  password?: string;
  role?: string;
  createdAt: Date | null;
  status?: string;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isPrivate: boolean;
  createdAt: Date | null;
}

export interface Game {
  id: string;
  rawgId?: number;
  name: string;
  genre?: string;
  platforms?: string;
  developer?: string;
  publisher?: string;
  shortDescription?: string;
  description?: string;
  coverUrl?: string;
  coverUrlHd?: string;
  rating?: number;
  releaseYear?: number;
  createdAt: Date | null;
}

export interface Upload {
  id: string;
  profileId: string;
  gameId: string;
  title: string;
  description?: string;
  type: string;
  tags?: string;
  likesCount?: number;
  commentsCount?: number;
  createdAt: Date | null;
  publicId: number;
}

export interface UploadImage {
  id: string;
  uploadId: string;
  imageUrl: string;
  order?: number;
  caption?: string;
  isMain?: boolean;
  width?: number;
  height?: number;
  format?: string;
  resolution?: string;
  gameVersion?: string;
  thumbnailUrl?: string;
  createdAt: Date | null;
}

export interface Collection {
  id: string;
  profileId: string;
  name: string;
  description?: string;
  visibility: string;
  coverImageUrl?: string;
  itemsCount?: number;
  followersCount?: number;
  slug: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  uploadId: string;
  addedAt: Date | null;
  order?: number;
}

export interface CollectionPermission {
  id: string;
  collectionId: string;
  profileId: string;
  permission: string;
  grantedAt: Date | null;
  grantedBy: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface UploadComment {
  id: string;
  uploadId: string;
  profileId: string;
  content: string;
  replyTo?: string;
  createdAt: Date | null;
}

// ─────────────────────────────
// 🎯 INTERFACES COMPUESTAS
// ─────────────────────────────

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
  _count?: {
    followers: number;
    items: number;
  };
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}

export interface CollectionWithFullDetails extends Collection {
  profile: Profile;
  items: CollectionItemWithUpload[];
  followers: CollectionFollower[];
  permissions: CollectionPermissionWithProfile[];
  isFollowing?: boolean;
  canEdit?: boolean;
  canView?: boolean;
}

export interface CollectionFollower {
  followerId: string;
  createdAt: Date | string | null;
  follower: Profile;
}

export interface CollectionPermissionWithProfile extends CollectionPermission {
  profile: Profile;
  grantedByProfile: Profile;
}

export interface CollectionItemWithUpload extends CollectionItem {
  upload: UploadWithDetails;
}

export interface CollectionPreview extends Collection {
  profile: Profile;
  previewUploads: UploadWithDetails[];
  _count?: {
    followers: number;
    items: number;
  };
}

export interface CollectionWithUpload extends Collection {
  hasUpload: boolean;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  visibility: "public" | "private" | "restricted";
  coverImageUrl?: string;
  collaborators?: string[]; // Array de IDs de perfiles colaboradores
}

export interface FilterState {
  searchText: string;
  tags: string[];
  platform: string | undefined;
  releaseYear: string | number | undefined;
  inMyCollections: boolean;
  sortBy: "newest" | "oldest" | "popular";
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

// ─────────────────────────────
// 🔍 SEARCH & FILTER TYPES
// ─────────────────────────────

export interface FilterOptions {
  platforms: string[];
  releaseYears: number[];
}

export interface FilterState {
  searchText: string;
  tags: string[];
  platform: string | undefined;
  releaseYear: string | number | undefined;
  inMyCollections: boolean;
  sortBy: "newest" | "oldest" | "popular";
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
  displayName?: string;
  avatarUrl?: string;
  followersCount?: number;
  uploadsCount?: number;
}

// ─────────────────────────────
// 📊 PAGINATION
// ─────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

// ─────────────────────────────
// 🔐 AUTH TYPES
// ─────────────────────────────

export interface AuthResult {
  type: "success" | "error";
  message: string;
  redirectUrl?: string;
}

export interface LoginResponse extends AuthResult {
  user?: UserWithProfile;
}

export interface SignupResponse extends AuthResult {
  user?: UserWithProfile;
}

// ─────────────────────────────
// 📧 EMAIL TYPES
// ─────────────────────────────

export interface EmailActionResponse {
  status: boolean;
  message: string;
}

// ─────────────────────────────
// 🎮 GAME GENRE MAP
// ─────────────────────────────

export interface GameGenreMap {
  [key: string]: string;
}

// ─────────────────────────────
// 🎯 API RESPONSE TYPES
// ─────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  status?: number;
}

// ─────────────────────────────
// 🔧 UTILITY TYPES
// ─────────────────────────────

export type SortOrder = "asc" | "desc";

export type UploadType = "screenshot" | "artwork" | "meme" | "guide";

export type CollectionVisibility = "public" | "private" | "restricted";

export type NotificationType = "like" | "comment" | "follow" | "collection_add";

export type UserRole = "user" | "admin" | "moderator";

export type UserStatus = "active" | "suspended" | "pending";
