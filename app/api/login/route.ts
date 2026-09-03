import { NextResponse } from 'next/server';
import { pbkdf2Sync, randomBytes, createHash, timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';

function cleanPhone(v:string){ return v.replace(/[^0-9+]/g,'').trim(); }
function decodeBase64Url(v:string){ const pad='='.repeat((4-(v.length%4))%4); return Buffer.from((v+pad).replace(/-/g,'+').replace(/_/g,'/'),'base64'); }
function verifyPassword(password:string, encoded:string){
  const [algo,iterRaw,saltRaw,hashRaw]=encoded.split('$');
  if(algo!=='pbkdf2_sha256'||!iterRaw||!saltRaw||!hashRaw) return false;
  const iterations=Number(iterRaw); if(!Number.isFinite(iterations)||iterations<100000) return false;
  const salt=decodeBase64Url(saltRaw); const expected=decodeBase64Url(hashRaw);
  const actual=pbkdf2Sync(password,salt,iterations,expected.length,'sha256');
  return expected.length===actual.length && timingSafeEqual(expected,actual);
}
function hashToken(token:string){ return createHash('sha256').update(token).digest('hex'); }

export async function POST(req:Request){
  try{
    const form=await req.formData();
    const phone=cleanPhone(String(form.get('phone')||''));
    const password=String(form.get('password')||'');
    const sql=db();
    const rows=await sql`SELECT id, password_hash, role FROM users WHERE phone=${phone} LIMIT 1` as {id:string,password_hash:string,role:string}[];
    const user=rows[0];
    if(!user || !verifyPassword(password,user.password_hash)) return NextResponse.redirect(new URL('/login?error=1',req.url),303);

    const token=randomBytes(32).toString('hex');
    const tokenHash=hashToken(token);
    const expires=new Date(Date.now()+1000*60*60*24*14);
    await sql`INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (${user.id}, ${tokenHash}, ${expires.toISOString()})`;

    const target=user.role==='TEACHER'||user.role==='ADMIN'?'/teacher':'/dashboard';
    const res=NextResponse.redirect(new URL(target,req.url),303);
    res.cookies.set('prof_anis_session',token,{httpOnly:true,sameSite:'lax',secure:true,path:'/',expires});
    return res;
  }catch(err){
    console.error('login_api_error',err);
    return NextResponse.redirect(new URL('/login?server=1',req.url),303);
  }
}
