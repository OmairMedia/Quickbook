import type { H3Event } from "h3";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "~/server/utils/db";
import {
  users,
  refreshTokens,
  passwordResetTokens,
  emailVerificationTokens,
} from "~/server/db/schema";
import {
  sendVerificationEmail as sendEmailVerification,
  sendPasswordResetEmail,
} from "~/server/utils/email";

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServerUserWithPassword extends ServerUser {
  passwordHash: string;
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<ServerUser | null> {
  const row = db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .get();

  if (!row) return null;

  const match = await bcrypt.compare(password, row.passwordHash);
  if (!match) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar ?? undefined,
    role: row.role,
    emailVerified: row.emailVerified,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function findUserByEmail(
  email: string,
): Promise<ServerUserWithPassword | null> {
  const row = db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .get();

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar ?? undefined,
    role: row.role,
    emailVerified: row.emailVerified,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    passwordHash: row.passwordHash,
  };
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<ServerUser> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(data.password, 12);

  db.insert(users)
    .values({
      id,
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash,
      role: "user",
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return {
    id,
    email: data.email.toLowerCase(),
    name: data.name,
    role: "user",
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function generateAccessToken(_user: ServerUser): string {
  return crypto.randomUUID();
}

export function generateRefreshToken(user: ServerUser): string {
  const id = crypto.randomUUID();
  const token = crypto.randomUUID();
  const now = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  db.insert(refreshTokens)
    .values({ id, userId: user.id, token, expiresAt, createdAt: now })
    .run();

  return token;
}

export function verifyRefreshToken(token: string): ServerUser {
  const row = db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token))
    .get();

  if (!row) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid refresh token",
    });
  }

  if (new Date(row.expiresAt) < new Date()) {
    throw createError({
      statusCode: 401,
      statusMessage: "Refresh token expired",
    });
  }

  const user = db.select().from(users).where(eq(users.id, row.userId)).get();

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "User not found",
    });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar ?? undefined,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function invalidateRefreshToken(token: string): Promise<void> {
  db.delete(refreshTokens).where(eq(refreshTokens.token, token)).run();
}

export async function sendVerificationEmail(user: ServerUser): Promise<void> {
  const token = crypto.randomUUID();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  db.insert(emailVerificationTokens)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      email: user.email,
      token,
      expiresAt,
      createdAt: now,
    })
    .run();

  await sendEmailVerification(user.email, token);
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toSessionUser(user: ServerUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function useAuthenticatedUser(
  event: H3Event,
): Promise<ServerUser> {
  const session = await getUserSession(event);
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  const user = session.user as unknown as ServerUser;

  const fresh = db.select().from(users).where(eq(users.id, user.id)).get();

  if (!fresh) {
    throw createError({ statusCode: 401, statusMessage: "User not found" });
  }

  return {
    id: fresh.id,
    email: fresh.email,
    name: fresh.name,
    avatar: fresh.avatar ?? undefined,
    role: fresh.role,
    emailVerified: fresh.emailVerified,
    createdAt: fresh.createdAt,
    updatedAt: fresh.updatedAt,
  };
}

export function generateResetToken(user: ServerUser): string {
  const id = crypto.randomUUID();
  const token = crypto.randomUUID();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  db.insert(passwordResetTokens)
    .values({ id, email: user.email, token, expiresAt, createdAt: now })
    .run();

  return token;
}

export function verifyResetToken(token: string): {
  valid: boolean;
  email?: string;
} {
  const row = db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .get();

  if (!row) return { valid: false };
  if (new Date(row.expiresAt) < new Date()) return { valid: false };

  return { valid: true, email: row.email };
}

export async function updatePassword(
  email: string,
  newPassword: string,
): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const now = new Date().toISOString();

  db.update(users)
    .set({ passwordHash, updatedAt: now })
    .where(eq(users.email, email.toLowerCase()))
    .run();

  db.delete(passwordResetTokens)
    .where(eq(passwordResetTokens.email, email.toLowerCase()))
    .run();
}
