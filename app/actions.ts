'use server';

import { redirect } from 'next/navigation';
import { pbkdf2Sync, timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';
import { createSession, endSession } from '@/lib/auth';

function cleanPhone(v:string){ return v.replace(/[^0-9+]/g,'').trim(); }

function decodeBase64Url(v:string){
  const pad = '='.repeat((4 - (v.length % 4)) % 4);
  return Buffer.from((v + pad).replace(/-/g,'+').replace(/_/g,'/'),'base64');
}

function verifyPassword(password:string, encoded:string){
  const [algo, iterRaw, saltRaw, hashRaw] = encoded.split('$');
  if (algo !== 'pbkdf2_sha256' || !iterRaw || !saltRaw || !hashRaw) return false;
  const iterations = Number(iterRaw);
  if (!Number.isFinite(iterations) || iterations < 100000) return false;
  const salt = decodeBase64Url(saltRaw);
  const expected = decodeBase64Url(hashRaw);
  const actual = pbkdf2Sync(password, salt, iterations, expected.length, 'sha256');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function captureLead(formData:FormData){
  const fullName = String(formData.get('full_name')||'').trim();
  const phone = cleanPhone(String(formData.get('phone')||''));
  const level = String(formData.get('level')||'1BAC').trim();
  if (!fullName || phone.length < 8) redirect('/?lead=invalid#test');
  const sql = db();
  await sql`INSERT INTO leads (full_name, phone, level, source) VALUES (${fullName}, ${phone}, ${level}, 'landing-page')`;
  redirect('/?lead=ok#test');
}

export async function loginAction(formData:FormData){
  const phone = cleanPhone(String(formData.get('phone')||''));
  const password = String(formData.get('password')||'');
  const sql = db();
  const rows = await sql`SELECT id, password_hash, role FROM users WHERE phone=${phone} LIMIT 1` as {id:string,password_hash:string,role:string}[];
  const user = rows[0];
  if (!user || !verifyPassword(password,user.password_hash)) redirect('/login?error=1');
  await createSession(user.id);
  redirect(user.role==='TEACHER' || user.role==='ADMIN' ? '/teacher' : '/dashboard');
}

export async function updateLeadStatus(formData:FormData){
  const userId = String(formData.get('lead_id')||'');
  const status = String(formData.get('status')||'NEW');
  const allowed = ['NEW','CONTACTED','QUALIFIED','ENROLLED','LOST'];
  if (!userId || !allowed.includes(status)) return;
  const sql = db();
  await sql`UPDATE leads SET status=${status} WHERE id=${userId}`;
  redirect('/teacher');
}

export async function logoutAction(){
  await endSession();
  redirect('/login');
}
