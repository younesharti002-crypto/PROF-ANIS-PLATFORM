import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  createSessionForUser,
  deleteSessionByToken,
  getAuthenticatedSession,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '@/src/lib/auth/session';

export type SessionUser = {
  id: string;
  full_name: string;
  phone: string;
  role: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';
  level: string | null;
};

export async function createSession(userId: string) {
  const session = await createSessionForUser(userId);
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, session.token, getSessionCookieOptions(session.expiresAt));
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await getAuthenticatedSession(token);
  if (!session) return null;

  return {
    id: session.user.id,
    full_name: session.user.fullName,
    phone: session.user.phone,
    role: session.user.role,
    level: session.user.level,
  };
}

export async function requireUser(role?: SessionUser['role']) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (role && user.role !== role && user.role !== 'ADMIN') redirect('/dashboard');
  return user;
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (token) await deleteSessionByToken(token);
  jar.delete(SESSION_COOKIE_NAME);
}
