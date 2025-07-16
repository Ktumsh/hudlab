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
} from "drizzle-orm/pg-core";

// ─────────────────────────────
// 🔘 USERS
// ─────────────────────────────
export const users = table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  provider: varchar("provider", { length: 50 }),
  providerId: varchar("provider_id", { length: 255 }),
  role: varchar("role", { length: 20 }).default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("active"),
});

// ─────────────────────────────
// 👤 PROFILES
// ─────────────────────────────
export const profiles = table("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────
// 👥 USER FOLLOWS (N:M)
// ─────────────────────────────
export const userFollows = table(
  "user_follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id),
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
export const uploads = table("uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  tags: text("tags"),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  publicId: serial("public_id").notNull().unique(),
});

// ─────────────────────────────
// 📌 UPLOAD TAGS (N:M)
// ─────────────────────────────
export const uploadTags = table(
  "upload_tags",
  {
    uploadId: uuid("upload_id")
      .notNull()
      .references(() => uploads.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.uploadId, t.tagId] })],
);

// ─────────────────────────────
// 🧡 FAVORITES
// ─────────────────────────────
export const favorites = table("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  uploadId: uuid("upload_id")
    .notNull()
    .references(() => uploads.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ❤️ LIKES
export const likes = table("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  uploadId: uuid("upload_id")
    .notNull()
    .references(() => uploads.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────
// 💬 COMMENTS
// ─────────────────────────────
export const uploadComments = table("upload_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  uploadId: uuid("upload_id")
    .notNull()
    .references(() => uploads.id),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  content: text("content").notNull(),
  replyTo: uuid("reply_to"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────
// 💬 COMMENT LIKES
// ─────────────────────────────
export const commentLikes = table(
  "comment_likes",
  {
    commentId: uuid("comment_id")
      .notNull()
      .references(() => uploadComments.id),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
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
    .references(() => uploads.id),
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
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  uploads: many(uploads),
  favorites: many(favorites),
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
  favoritedBy: many(favorites),
  tags: many(uploadTags),
  comments: many(uploadComments),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  profile: one(profiles, {
    fields: [favorites.profileId],
    references: [profiles.id],
  }),
  upload: one(uploads, {
    fields: [favorites.uploadId],
    references: [uploads.id],
  }),
}));

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
export type Profile = InferSelectModel<typeof profiles>;
export type UserFollow = InferSelectModel<typeof userFollows>;
export type EmailSend = InferSelectModel<typeof emailSends>;
export type Upload = InferSelectModel<typeof uploads>;
export type Favorite = InferSelectModel<typeof favorites>;
export type Game = InferSelectModel<typeof games>;
export type Tag = InferSelectModel<typeof tags>;
export type GameTag = InferSelectModel<typeof gameTags>;
export type UploadComment = InferSelectModel<typeof uploadComments>;
export type CommentLike = InferSelectModel<typeof commentLikes>;
export type Notification = InferSelectModel<typeof notifications>;
export type Report = InferSelectModel<typeof reports>;
