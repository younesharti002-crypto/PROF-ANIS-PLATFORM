import { timingSafeEqual } from 'node:crypto';
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

const DEMO_STUDENT_PHONE = '+212600000101';

function safeEqualText(a: string, b: string): boolean {
  const aa = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

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
  const normalizedPhone = normalizeMoroccanPhone(phoneInput);

  return authenticateLoginCore(phoneInput, password, {
    normalizePhone: normalizeMoroccanPhone,
    findUserByPhone,
    verifyPassword: async (plainPassword, storedHash) => {
      if (await verifyPassword(plainPassword, storedHash)) return true;

      const demoPassword = process.env.DEMO_STUDENT_PASSWORD ?? '';
      return Boolean(
        normalizedPhone === DEMO_STUDENT_PHONE &&
        demoPassword.length > 0 &&
        safeEqualText(plainPassword, demoPassword),
      );
    },
    touchUserLogin,
  });
}
