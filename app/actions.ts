'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { endSession } from '@/lib/auth';

function cleanPhone(v:string){ return v.replace(/[^0-9+]/g,'').trim(); }

export async function captureLead(formData:FormData){
  const fullName = String(formData.get('full_name')||'').trim();
  const phone = cleanPhone(String(formData.get('phone')||''));
  const level = String(formData.get('level')||'1BAC').trim();
  if (!fullName || phone.length < 8) redirect('/?lead=invalid#test');
  const sql = db();
  await sql`INSERT INTO leads (full_name, phone, level, source) VALUES (${fullName}, ${phone}, ${level}, 'landing-page')`;
  redirect('/?lead=ok#test');
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
