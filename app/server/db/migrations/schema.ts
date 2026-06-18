import { sqliteTable, AnySQLiteColumn, foreignKey, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const notes = sqliteTable("notes", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id),
	title: text().notNull(),
	content: text().default(""),
	tags: text().default("[]"),
	isFavorite: integer("is_favorite").default(false).notNull(),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	token: text().notNull(),
	expiresAt: text("expires_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("password_reset_tokens_token_unique").on(table.token),
]);

export const refreshTokens = sqliteTable("refresh_tokens", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id),
	token: text().notNull(),
	expiresAt: text("expires_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("refresh_tokens_token_unique").on(table.token),
]);

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	avatar: text(),
	role: text().default("user").notNull(),
	emailVerified: integer("email_verified").default(false).notNull(),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
},
(table) => [
	uniqueIndex("users_email_unique").on(table.email),
]);

