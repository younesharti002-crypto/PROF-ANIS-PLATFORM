import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell, Topbar } from '../components';
export const dynamic='force-dynamic';

type LiveRow={id:string;title:string;starts_at:string;meeting_url:string|null;replay_url:string|null;status:string};

export default async function Live(){
  const user=await requireUser();
  const sql=db();
  const rows=await sql`SELECT id,title,starts_at,meeting_url,replay_url,status FROM live_classes ORDER BY starts_at DESC LIMIT 12` as LiveRow[];
  const upcoming=rows.filter(r=>new Date(r.starts_at)>new Date()).sort((a,b)=>+new Date(a.starts_at)-+new Date(b.starts_at));
  const replays=rows.filter(r=>r.replay_url);
  return <AppShell active="Live & Replays" userName={user.full_name}><Topbar title="Live & Replays" subtitle="Les séances viennent directement du planning de la plateforme." userName={user.full_name}/><div className="grid3">{upcoming.map(r=><div className="card" key={r.id}><div className="eyebrow">🔴 Prochain Live</div><h3>{r.title}</h3><p>{new Date(r.starts_at).toLocaleString('fr-FR',{weekday:'long',day:'2-digit',month:'long',hour:'2-digit',minute:'2-digit'})}</p>{r.meeting_url&&<a className="btn primary" style={{marginTop:16}} href={r.meeting_url}>Ouvrir la séance</a>}</div>)}{replays.map(r=><div className="card" key={`replay-${r.id}`}><div className="cardIcon">▶</div><h3>Replay — {r.title}</h3><a className="btn ghost" href={r.replay_url!}>Regarder</a></div>)}{rows.length===0&&<div className="card"><h3>Aucune séance programmée</h3><p>Le professeur peut ajouter les prochaines séances depuis son espace.</p></div>}</div></AppShell>
}
