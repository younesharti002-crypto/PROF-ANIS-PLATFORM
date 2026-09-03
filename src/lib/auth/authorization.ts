import type { NextRequest } from 'next/server';
import {
  getAuthenticatedSession,
  SESSION_COOKIE_NAME,
  type AuthenticatedSession,
} from '@/src/lib/auth/session';

export type UserRole = AuthenticatedSession['user']['role'];

export type AuthorizationResult =
  | { ok: true; session: AuthenticatedSession }
  | { ok: false; reason: 'UNAUTHENTICATED' | 'FORBIDDEN' };

export async function authorizeRequest(
  request: NextRequest,
  allowedRoles?: readonly UserRole[],
): Promise<AuthorizationResult> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return { ok: false, reason: 'UNAUTHENTICATED' };

  const session = await getAuthenticatedSession(token);
  if (!session) return { ok: false, reason: 'UNAUTHENTICATED' };

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { ok: false, reason: 'FORBIDDEN' };
  }

  return { ok: true, session };
}
