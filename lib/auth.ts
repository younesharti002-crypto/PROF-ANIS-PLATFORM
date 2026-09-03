import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';
import { redirect } from 'next/navigation';
import { db } from './db';

export type SessionUser = { id:string; full_name:string; phone:string; role:'STUDENT'|'TEACHER'|'ADMIN'; level:string|null };
const COOKIE = 'prof_anis_session';

export function hashToken(token:string){ return createHash('sha256').update(token).digest('hex'); }

export async function createSession(userId:string){
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + 1000*60*60*24*14);
  const sql = db();
  await sql`INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (${userId}, ${tokenHash}, ${expires.toISOString()})`;
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', path:'/', expires });
}

export async function getCurrentUser():Promise<SessionUser|null>{
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token || !process.env.DATABASE_URL) return null;
  const sql = db();
  const rows = await sql`
    SELECT u.id, u.full_name, u.phone, u.role, u.level
    FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=${hashToken(token)} AND s.expires_at > now()
    LIMIT 1` as SessionUser[];
  return rows[0] ?? null;
}

export async function requireUser(role?:SessionUser['role']){
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (role && user.role !== role && user.role !== 'ADMIN') redirect('/dashboard');
  return user;
}

export async function endSession(){
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && process.env.DATABASE_URL){
    const sql = db();
    await sql`DELETE FROM sessions WHERE token_hash=${hashToken(token)}`;
  }
  jar.delete(COOKIE);
}
