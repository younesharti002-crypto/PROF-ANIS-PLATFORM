import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function sanitizeMessage(value: unknown) {
  return String(value ?? 'Unknown database error')
    .replace(/postgres(?:ql)?:\/\/[^@\s]+@/gi, 'postgresql://***@')
    .replace(/npg_[A-Za-z0-9_-]+/g, '***')
    .slice(0, 350);
}

export async function GET(){
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    return NextResponse.json({ ok:false, database:'missing' }, { status:500 });
  }

  let host: string | null = null;
  let validUrl = false;
  try {
    const parsed = new URL(raw.trim());
    host = parsed.hostname || null;
    validUrl = parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
  } catch {}

  try {
    const sql = db();
    const rows = await sql`SELECT 1 AS ok` as {ok:number}[];
    return NextResponse.json({
      ok: rows[0]?.ok === 1,
      database:'connected',
      diagnostic:{ validUrl, host, pooled: host?.includes('-pooler.') ?? false }
    });
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string; code?: string };
    return NextResponse.json({
      ok:false,
      database:'error',
      diagnostic:{
        validUrl,
        host,
        pooled: host?.includes('-pooler.') ?? false,
        errorName: sanitizeMessage(err?.name || 'Error'),
        errorCode: sanitizeMessage(err?.code || ''),
        errorMessage: sanitizeMessage(err?.message || error)
      }
    }, { status:500 });
  }
}
