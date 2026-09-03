import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(){
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ ok:false, database:'missing' }, { status:500 });
    }
    const sql = db();
    const rows = await sql`SELECT 1 AS ok` as {ok:number}[];
    return NextResponse.json({ ok: rows[0]?.ok === 1, database:'connected' });
  } catch {
    return NextResponse.json({ ok:false, database:'error' }, { status:500 });
  }
}
