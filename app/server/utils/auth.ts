import type { H3Event } from "h3";

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

const NOT_CONFIGURED =
  "Database not configured. This is a stub — implement with Drizzle ORM when ready.";

export async function authenticateUser(
  email: string,
  _password: string,
): Promise<ServerUser | null> {
  console.warn(
    `[auth stub] authenticateUser called for: ${email}. ${NOT_CONFIGURED}`,
  );
  return null;
}

export async function findUserByEmail(
  email: string,
): Promise<ServerUserWithPassword | null> {
  console.warn(
    `[auth stub] findUserByEmail called for: ${email}. ${NOT_CONFIGURED}`,
  );
  return null;
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<ServerUser> {
  console.warn(
    `[auth stub] createUser called for: ${data.email}. ${NOT_CONFIGURED}`,
  );
  throw createError({ statusCode: 501, statusMessage: NOT_CONFIGURED });
}

export function generateAccessToken(user: ServerUser): string {
  console.warn(
    `[auth stub] generateAccessToken for: ${user.email}. ${NOT_CONFIGURED}`,
  );
  throw createError({ statusCode: 501, statusMessage: NOT_CONFIGURED });
}

export function generateRefreshToken(user: ServerUser): string {
  console.warn(
    `[auth stub] generateRefreshToken for: ${user.email}. ${NOT_CONFIGURED}`,
  );
  throw createError({ statusCode: 501, statusMessage: NOT_CONFIGURED });
}

export function verifyRefreshToken(_token: string): ServerUser {
  console.warn(`[auth stub] verifyRefreshToken called. ${NOT_CONFIGURED}`);
  throw createError({ statusCode: 501, statusMessage: NOT_CONFIGURED });
}

export async function invalidateRefreshToken(_token: string): Promise<void> {
  console.warn(`[auth stub] invalidateRefreshToken called. ${NOT_CONFIGURED}`);
}

export async function sendVerificationEmail(user: ServerUser): Promise<void> {
  console.warn(
    `[auth stub] sendVerificationEmail for: ${user.email}. ${NOT_CONFIGURED}`,
  );
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
  return session.user as unknown as ServerUser;
}
