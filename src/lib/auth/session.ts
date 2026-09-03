import { createHash, randomBytes } from 'node:crypto';
import { db } from '@/lib/db';

export const SESSION_COOKIE_NAME = 'prof_anis_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function hashSessionToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export type CreatedSession = {
  token: string;
  expiresAt: Date;
};

export type AuthenticatedSession = {
  sessionId: string;
  expiresAt: Date;
  user: {
    id: string;
    fullName: string;
    phone: string;
    role: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';
    status: 'ACTIVE' | 'DISABLED';
    preferredLanguage: 'ar' | 'fr';
    level: string | null;
  };
};

export async function createSessionForUser(userId: string): Promise<CreatedSession> {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const sql = db();

  await sql`
    INSERT INTO sessions (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  return { token, expiresAt };
}

export async function getAuthenticatedSession(token: string): Promise<AuthenticatedSession | null> {
  if (!token || token.length > 256) return null;

  const tokenHash = hashSessionToken(token);
  const now = new Date();
  const sql = db();
  const rows = await sql`
    SELECT
      s.id AS "sessionId",
      s.expires_at AS "expiresAt",
      u.id AS "userId",
      u.full_name AS "fullName",
      u.phone,
      u.role,
      COALESCE(u.status, 'ACTIVE') AS status,
      COALESCE(u.preferred_language, 'fr') AS "preferredLanguage",
      u.level
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.expires_at > ${now.toISOString()}
      AND COALESCE(u.status, 'ACTIVE') = 'ACTIVE'
    LIMIT 1
  ` as Array<{
    sessionId: string;
    expiresAt: string | Date;
    userId: string;
    fullName: string;
    phone: string;
    role: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';
    status: 'ACTIVE' | 'DISABLED';
    preferredLanguage: 'ar' | 'fr';
    level: string | null;
  }>;

  const row = rows[0];
  if (!row) return null;

  await sql`UPDATE sessions SET last_seen_at = ${now.toISOString()} WHERE id = ${row.sessionId}`;

  return {
    sessionId: row.sessionId,
    expiresAt: row.expiresAt instanceof Date ? row.expiresAt : new Date(row.expiresAt),
    user: {
      id: row.userId,
      fullName: row.fullName,
      phone: row.phone,
      role: row.role,
      status: row.status,
      preferredLanguage: row.preferredLanguage,
      level: row.level,
    },
  };
}

export async function deleteSessionByToken(token: string): Promise<void> {
  if (!token || token.length > 256) return;
  const sql = db();
  await sql`DELETE FROM sessions WHERE token_hash = ${hashSessionToken(token)}`;
}

export function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
}
