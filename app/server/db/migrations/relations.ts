import { relations } from "drizzle-orm/relations";
import { users, notes, refreshTokens } from "./schema";

export const notesRelations = relations(notes, ({one}) => ({
	user: one(users, {
		fields: [notes.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	notes: many(notes),
	refreshTokens: many(refreshTokens),
}));

export const refreshTokensRelations = relations(refreshTokens, ({one}) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id]
	}),
}));