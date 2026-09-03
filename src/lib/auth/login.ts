import { db } from '@/lib/db';
import { normalizeMoroccanPhone } from '@/src/lib/auth/phone';
import { verifyPassword } from '@/src/lib/auth/password';
import {
  authenticateLoginCore,
  type LoginCredentialUser,
  type LoginResult,
  type SafeLoginUser,
} from '@/src/lib/auth/login-core';

export type { LoginResult, SafeLoginUser } from '@/src/lib/auth/login-core';

async function findUserByPhone(phone: string): Promise<LoginCredentialUser | null> {
  const sql = db();
  const rows = await sql`
    SELECT
      id,
      full_name AS "fullName",
      phone,
      password_hash AS "passwordHash",
      role,
      COALESCE(status, 'ACTIVE') AS status,
      COALESCE(preferred_language, 'fr') AS "preferredLanguage"
    FROM users
    WHERE phone = ${phone}
    LIMIT 1
  ` as LoginCredentialUser[];

  return rows[0] ?? null;
}

async function touchUserLogin(userId: string, at: Date): Promise<void> {
  const sql = db();
  await sql`
    UPDATE users
    SET last_login_at = ${at.toISOString()}, updated_at = ${at.toISOString()}
    WHERE id = ${userId}
  `;
}

export async function authenticateWithPhoneAndPassword(
  phoneInput: string,
  password: string,
): Promise<LoginResult> {
  return authenticateLoginCore(phoneInput, password, {
    normalizePhone: normalizeMoroccanPhone,
    findUserByPhone,
    verifyPassword,
    touchUserLogin,
  });
}
