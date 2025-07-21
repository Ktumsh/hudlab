import { relations, InferSelectModel } from "drizzle-orm";
import {
  pgTable as table,
  varchar,
  timestamp,
  uuid,
  text,
  integer,
  boolean,
  primaryKey,
  serial,
  index,
} from "drizzle-orm/pg-core";

// ─────────────────────────────
// 🔘 USERS
// ─────────────────────────────
export const users = table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  role: varchar("role", { length: 20 }).default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("active"),
});

// ─────────────────────────────
// 🔗 USER ACCOUNTS (OAuth + Credentials)
// ─────────────────────────────
export const userAccounts = table("user_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(), // 'google', 'discord', 'credentials'
  providerId: varchar("provider_id", { length: 255 }), // ID del provider (null para credentials)
  lastUsedAt: timestamp("last_used_at").defaultNow(), // Nueva: última vez que usó este provider
  createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────
// 💾 LAST SESSION (Recordar último login)
// ─────────────────────────────
export const lastSessions = table("last_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 })
    .notNull()
    .unique(), // Hash del navegador/dispositivo
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(),
  userDisplayName: varchar("user_display_name", { length: 100 }).notNull(),
  userAvatarUrl: text("user_avatar_url"),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────
// 👤 PROFILES
// ─────────────────────────────
export const profiles = table(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    username: varchar("username", { length: 50 }).notNull().unique(),
    displayName: varchar("display_name", { length: 100 }),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // 🔍 Índice optimizado para búsqueda de usuarios
    index("idx_profiles_search_optimized").on(
      table.username,
      table.displayName,
      table.createdAt,
    ),
  ],
);

// ─────────────────────────────
// 👥 USER FOLLOWS (N:M)
// ─────────────────────────────
export const userFollows = table(
  "user_follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followingId] })],
);

// ─────────────────────────────
// 📧 EMAIL SENDS
// ─────────────────────────────
export const emailSends = table("email_sends", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  code: varchar("code", { length: 6 }),
  token: varchar("token", { length: 64 }).notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  verifiedAt: timestamp("verified_at"),
});

// ─────────────────────────────
// 🎮 GAMES
// ─────────────────────────────
export const games = table("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  rawgId: integer("rawg_id").unique(),
  name: varchar("name", { length: 200 }).notNull(),
  genre: text("genre"),
  platforms: text("platforms"),
  developer: varchar("developer", { length: 100 }),
  publisher: varchar("publisher", { length: 100 }),
  shortDescription: text("short_description"),
  description: text("description"),
  coverUrl: text("cover_url"),
  coverUrlHd: text("cover_url_hd"),
  rating: integer("rating"),
  releaseYear: integer("release_year"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────
// 🏷️ TAGS
// ─────────────────────────────
export const tags = table("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

// ─────────────────────────────
// 🏷️ GAME TAGS (N:M)
// ─────────────────────────────
export const gameTags = table(
  "game_tags",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.tagId] })],
);

// ─────────────────────────────
// 🖼️ UPLOADS
// ─────────────────────────────
export const uploads = table(
  "uploads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id),
    title: varchar("title", { length: 150 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 30 }).notNull(),
    tags: text("tags"),
    likesCount: integer("likes_count").default(0),
    commentsCount: integer("comments_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    publicId: serial("public_id").notNull().unique(),
  },
  (table) => [
    // 🔍 Índice optimizado para búsqueda básica (title, description)
    index("idx_uploads_search_optimized").on(
      table.title,
      table.description,
      table.createdAt,
    ),
    // 📊 Índice para popularidad (likes_count, created_at)
    index("idx_uploads_popular_search").on(
      table.likesCount.desc(),
      table.createdAt.desc(),
    ),
    //  Índice para joins frecuentes uploads->profiles
    index("idx_uploads_profile_join").on(
      table.profileId,
      table.createdAt.desc(),
    ),
    // 🎮 Índice para filtros por juego
    index("idx_uploads_game_filter").on(
      table.gameId,
      table.createdAt.desc(),
      table.likesCount.desc(),
    ),
    // ⏰ Índice para contenido reciente
    index("idx_uploads_recent_search").on(
      table.createdAt.desc(),
      table.title,
      table.likesCount.desc(),
    ),
    // 🔥 Índice para trending/populares
    index("idx_uploads_trending").on(
      table.likesCount.desc(),
      table.createdAt.desc(),
    ),
    // 🔤 Índice para autocompletado
    index("idx_uploads_autocomplete").on(table.title),
  ],
);

// ─────────────────────────────
// 🖼️ UPLOAD IMAGES (Nueva tabla para múltiples imágenes)
// ─────────────────────────────
export const uploadImages = table(
  "upload_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uploadId: uuid("upload_id")
      .notNull()
      .references(() => uploads.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    order: integer("order").default(0),
    caption: varchar("caption", { length: 200 }),
    isMain: boolean("is_main").default(false),
    width: integer("width"),
    height: integer("height"),
    format: varchar("format", { length: 10 }),
    resolution: varchar("resolution", { length: 20 }),
    gameVersion: varchar("game_version", { length: 50 }),
    thumbnailUrl: text("thumbnail_url"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // 🔗 Índice para obtener imágenes por upload (MUY usado)
    index("idx_upload_images_upload_id").on(table.uploadId, table.order),
    // 🖼️ Índice para primera imagen (order=1, isMain=true)
    index("idx_upload_images_main").on(
      table.uploadId,
      table.isMain,
      table.order,
    ),
  ],
);

// ─────────────────────────────
// 📌 UPLOAD TAGS (N:M)
// ─────────────────────────────
export const uploadTags = table(
  "upload_tags",
  {
    uploadId: uuid("upload_id")
      .notNull()
      .references(() => uploads.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.uploadId, t.tagId] })],
);

// ─────────────────────────────
// 📂 COLLECTIONS (Colecciones de uploads)
// ─────────────────────────────
export const collections = table("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  coverImageUrl: text("cover_image_url"),
  itemsCount: integer("items_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─────────────────────────────
// 📌 COLLECTION ITEMS (N:M entre collections y uploads)
// ─────────────────────────────
export const collectionItems = table("collection_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  uploadId: uuid("upload_id")
    .notNull()
    .references(() => uploads.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow(),
  order: integer("order").default(0),
});

// ❤️ LIKES
export const likes = table(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    uploadId: uuid("upload_id")
      .notNull()
      .references(() => uploads.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // ❤️ Índice para verificar si user ya dio like (MUY usado)
    index("idx_likes_user_upload").on(table.profileId, table.uploadId),
    // 📊 Índice para contar likes por upload
    index("idx_likes_upload_count").on(table.uploadId, table.createdAt.desc()),
  ],
);

// ─────────────────────────────
// 💬 COMMENTS
// ─────────────────────────────
export const uploadComments = table(
  "upload_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uploadId: uuid("upload_id")
      .notNull()
      .references(() => uploads.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    content: text("content").notNull(),
    replyTo: uuid("reply_to"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // 💬 Índice para obtener comentarios por upload (MUY usado)
    index("idx_comments_upload").on(table.uploadId, table.createdAt.desc()),
    // 💬 Índice para respuestas (threads de comentarios)
    index("idx_comments_replies").on(table.replyTo, table.createdAt),
  ],
);

// ─────────────────────────────
// 💬 COMMENT LIKES
// ─────────────────────────────
export const commentLikes = table(
  "comment_likes",
  {
    commentId: uuid("comment_id")
      .notNull()
      .references(() => uploadComments.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.commentId, t.profileId] })],
);

// ─────────────────────────────
// 🔔 NOTIFICATIONS
// ─────────────────────────────
export const notifications = table("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  type: varchar("type", { length: 50 }),
  data: text("data"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────
// 🚨 REPORTS
// ─────────────────────────────
export const reports = table("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  uploadId: uuid("upload_id")
    .notNull()
    .references(() => uploads.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────
// 🔗 RELATIONS
// ─────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  followers: many(userFollows, {
    relationName: "following",
  }),
  following: many(userFollows, {
    relationName: "follower",
  }),
  emailSends: many(emailSends),
  accounts: many(userAccounts),
}));

export const userAccountsRelations = relations(userAccounts, ({ one }) => ({
  user: one(users, {
    fields: [userAccounts.userId],
    references: [users.id],
  }),
}));

export const lastSessionsRelations = relations(lastSessions, ({ one }) => ({
  user: one(users, {
    fields: [lastSessions.userId],
    references: [users.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  uploads: many(uploads),
  collections: many(collections),
  comments: many(uploadComments),
  notifications: many(notifications),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const emailSendsRelations = relations(emailSends, ({ one }) => ({
  user: one(users, {
    fields: [emailSends.userId],
    references: [users.id],
  }),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  uploads: many(uploads),
  tags: many(gameTags),
}));

export const gameTagsRelations = relations(gameTags, ({ one }) => ({
  game: one(games, {
    fields: [gameTags.gameId],
    references: [games.id],
  }),
  tag: one(tags, {
    fields: [gameTags.tagId],
    references: [tags.id],
  }),
}));

export const uploadsRelations = relations(uploads, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [uploads.profileId],
    references: [profiles.id],
  }),
  game: one(games, {
    fields: [uploads.gameId],
    references: [games.id],
  }),
  collectionItems: many(collectionItems),
  tags: many(uploadTags),
  comments: many(uploadComments),
  images: many(uploadImages),
}));

export const uploadImagesRelations = relations(uploadImages, ({ one }) => ({
  upload: one(uploads, {
    fields: [uploadImages.uploadId],
    references: [uploads.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [collections.profileId],
    references: [profiles.id],
  }),
  items: many(collectionItems),
}));

export const collectionItemsRelations = relations(
  collectionItems,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionItems.collectionId],
      references: [collections.id],
    }),
    upload: one(uploads, {
      fields: [collectionItems.uploadId],
      references: [uploads.id],
    }),
  }),
);

export const likesRelations = relations(likes, ({ one }) => ({
  upload: one(uploads, {
    fields: [likes.uploadId],
    references: [uploads.id],
  }),
  profile: one(profiles, {
    fields: [likes.profileId],
    references: [profiles.id],
  }),
}));

export const uploadTagsRelations = relations(uploadTags, ({ one }) => ({
  upload: one(uploads, {
    fields: [uploadTags.uploadId],
    references: [uploads.id],
  }),
  tag: one(tags, {
    fields: [uploadTags.tagId],
    references: [tags.id],
  }),
}));

export const uploadCommentsRelations = relations(
  uploadComments,
  ({ one, many }) => ({
    upload: one(uploads, {
      fields: [uploadComments.uploadId],
      references: [uploads.id],
    }),
    profile: one(profiles, {
      fields: [uploadComments.profileId],
      references: [profiles.id],
    }),
    parent: one(uploadComments, {
      relationName: "commentReplies",
      fields: [uploadComments.replyTo],
      references: [uploadComments.id],
    }),
    replies: many(uploadComments, {
      relationName: "commentReplies",
    }),
    likes: many(commentLikes),
  }),
);

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(uploadComments, {
    fields: [commentLikes.commentId],
    references: [uploadComments.id],
  }),
  profile: one(profiles, {
    fields: [commentLikes.profileId],
    references: [profiles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  profile: one(profiles, {
    fields: [notifications.profileId],
    references: [profiles.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  profile: one(profiles, {
    fields: [reports.profileId],
    references: [profiles.id],
  }),
  upload: one(uploads, {
    fields: [reports.uploadId],
    references: [uploads.id],
  }),
}));

// ─────────────────────────────
// 🧾 TYPES
// ─────────────────────────────

export type User = InferSelectModel<typeof users>;
export type UserAccount = InferSelectModel<typeof userAccounts>;
export type LastSession = InferSelectModel<typeof lastSessions>;
export type Profile = InferSelectModel<typeof profiles>;
export type UserFollow = InferSelectModel<typeof userFollows>;
export type EmailSend = InferSelectModel<typeof emailSends>;
export type Upload = InferSelectModel<typeof uploads>;
export type UploadImage = InferSelectModel<typeof uploadImages>;
export type Collection = InferSelectModel<typeof collections>;
export type CollectionItem = InferSelectModel<typeof collectionItems>;
export type Game = InferSelectModel<typeof games>;
export type Tag = InferSelectModel<typeof tags>;
export type GameTag = InferSelectModel<typeof gameTags>;
export type UploadComment = InferSelectModel<typeof uploadComments>;
export type CommentLike = InferSelectModel<typeof commentLikes>;
export type Notification = InferSelectModel<typeof notifications>;
export type Report = InferSelectModel<typeof reports>;
