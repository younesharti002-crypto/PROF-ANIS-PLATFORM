import {
  pbkdf2Sync,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto';

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const MAX_PASSWORD_BYTES = 1_024;

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(derivedKey);
    });
  });
}

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value, 'base64url');
}

export async function hashPassword(password: string): Promise<string> {
  const size = Buffer.byteLength(password, 'utf8');
  if (size === 0 || size > MAX_PASSWORD_BYTES) throw new Error('Invalid password size');

  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await deriveKey(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return [
    'scrypt',
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString('base64url'),
    derivedKey.toString('base64url'),
  ].join('$');
}

async function verifyScrypt(password: string, encodedHash: string): Promise<boolean> {
  const parts = encodedHash.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(r) || !Number.isSafeInteger(p)) return false;
  if (n <= 1 || r <= 0 || p <= 0) return false;

  try {
    const salt = decodeBase64Url(saltRaw);
    const expected = decodeBase64Url(hashRaw);
    const actual = await deriveKey(password, salt, expected.length, { N: n, r, p });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function verifyLegacyPbkdf2(password: string, encodedHash: string): boolean {
  const [algo, iterRaw, saltRaw, hashRaw] = encodedHash.split('$');
  if (algo !== 'pbkdf2_sha256' || !iterRaw || !saltRaw || !hashRaw) return false;

  const iterations = Number(iterRaw);
  if (!Number.isSafeInteger(iterations) || iterations < 100_000) return false;

  try {
    const salt = decodeBase64Url(saltRaw);
    const expected = decodeBase64Url(hashRaw);
    const actual = pbkdf2Sync(password, salt, iterations, expected.length, 'sha256');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const size = Buffer.byteLength(password, 'utf8');
  if (size === 0 || size > MAX_PASSWORD_BYTES) return false;

  if (encodedHash.startsWith('scrypt$')) return verifyScrypt(password, encodedHash);
  if (encodedHash.startsWith('pbkdf2_sha256$')) return verifyLegacyPbkdf2(password, encodedHash);
  return false;
}
