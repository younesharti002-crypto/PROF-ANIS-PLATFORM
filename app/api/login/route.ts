import { NextResponse } from 'next/server';
import { authenticateWithPhoneAndPassword } from '@/src/lib/auth/login';
import {
  createSessionForUser,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '@/src/lib/auth/session';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const phone = String(form.get('phone') || '');
    const password = String(form.get('password') || '');

    const result = await authenticateWithPhoneAndPassword(phone, password);
    if (!result.ok) {
      const reason = result.reason === 'ACCOUNT_DISABLED' ? 'disabled' : '1';
      return NextResponse.redirect(new URL(`/login?error=${reason}`, req.url), 303);
    }

    const session = await createSessionForUser(result.user.id);
    const target = result.user.role === 'TEACHER' || result.user.role === 'ADMIN'
      ? '/teacher'
      : '/dashboard';

    const response = NextResponse.redirect(new URL(target, req.url), 303);
    response.cookies.set(
      SESSION_COOKIE_NAME,
      session.token,
      getSessionCookieOptions(session.expiresAt),
    );
    return response;
  } catch (error) {
    console.error('login_api_error', error instanceof Error ? error.message : 'unknown');
    return NextResponse.redirect(new URL('/login?server=1', req.url), 303);
  }
}
