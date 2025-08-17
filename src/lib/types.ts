import type { Icon, IconProps } from "@tabler/icons-react";

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
  lastProvider?: string;
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
  typeId: string;
  title: string;
  description?: string;
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
  status?: "pending" | "accepted";
}

export interface Tag {
  id: string;
  name: string;
  createdAt?: Date | null;
  usageCount?: number;
}

export interface UploadType {
  id: string;
  name: string;
  description?: string;
  createdAt?: Date | null;
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
  type: UploadType;
  tags: Tag[];
  comments: CommentWithRelations[];
  images: UploadImage[];
}

export interface UploadWithDetails extends Upload {
  profile: Profile;
  game: Game;
  type: UploadType;
  tags: Tag[];
  images: UploadImage[];
}

// ─────────────────────────────
// 🗂️ COLLECTION TYPES
// ─────────────────────────────
export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
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

export interface CollectionPreviewWithDetails extends CollectionPreview {
  followers: CollectionFollower[];
  permissions: CollectionPermissionWithProfile[];
}

export interface CollectionWithUpload extends Collection {
  hasUpload: boolean;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  visibility: CollectionVisibility;
  coverImageUrl?: string;
  collaborators?: string[]; // Array de IDs de perfiles colaboradores
  collaboratorsPermission?: CollaboratorPermission; // Permiso global aplicado a todos los colaboradores
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

export type UploadCategory = "screenshot" | "artwork" | "meme" | "guide";

export type CollaboratorPermission = "view" | "designer" | "admin";

export type CollectionVisibility = "public" | "private";

export type NotificationType = "like" | "comment" | "follow" | "collection_add";

export type UserRole = "user" | "admin" | "moderator";

export type UserStatus = "active" | "suspended" | "pending";

export type ShareTargetId =
  | "copy"
  | "whatsapp"
  | "facebook"
  | "x"
  | "telegram"
  | "email"
  | "instagram"
  | "discord"
  | "messenger"
  | "all";

// ─────────────────────────────
// ✉️ COLLECTION INVITATIONS
// ─────────────────────────────

export interface CollectionInvitationCollectionMini {
  id: string;
  name: string;
  slug: string;
  profile: Profile;
}

export interface CollectionInvitation {
  id: string;
  permission: CollaboratorPermission;
  status?: "pending" | "accepted";
  collection: Collection;
  grantedBy: Profile;
}

export interface PendingInvitation {
  id: string;
  profile: UserSearchResult;
  permission: CollaboratorPermission;
  createdAt: Date | string;
}

// ─────────────────────────────
// 📦 API payload/response helpers
// ─────────────────────────────

export interface CreateCollectionResponse {
  success: boolean;
  error?: string;
  collection?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface UpdateCollectionResponse {
  success: boolean;
  error?: string;
  collection?: {
    id: string;
    name: string;
    description?: string;
    visibility: CollectionVisibility;
    coverImageUrl?: string;
  };
}

// ─────────────────────────────
// Profile
// ─────────────────────────────
export interface ProfileStats {
  followers: number;
  following: number;
  uploads: number;
}

export interface ProfileData {
  profile: Profile | null;
  stats: ProfileStats;
  isFollowing: boolean;
}

// ─────────────────────────────
// 🔗 SHARE SHEET
// ─────────────────────────────

export interface ShareTarget {
  id: ShareTargetId;
  label: string;
  color: string;
  icon:
    | React.ComponentType<React.SVGProps<SVGSVGElement>>
    | React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  hrefBuilder?: (payload: {
    title?: string;
    text?: string;
    url?: string;
  }) => string;
  action?: (payload: {
    title?: string;
    text?: string;
    url?: string;
  }) => Promise<void> | void;
}
