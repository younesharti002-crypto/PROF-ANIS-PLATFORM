import { AppShell, Topbar } from '../components';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
export const dynamic='force-dynamic';

type Summary={avg_progress:number;completed:number;tracked:number;best_score:number|null};
type Lesson={title:string;course_title:string;progress_percent:number};
type Live={title:string;starts_at:string};

export default async function Dashboard(){
  const user=await requireUser();
  const sql=db();
  const s=await sql`
    SELECT coalesce(round(avg(progress_percent))::int,0) AS avg_progress,
      count(*) FILTER (WHERE progress_percent=100)::int AS completed,
      count(*)::int AS tracked,
      max(score)::int AS best_score
    FROM student_progress WHERE user_id=${user.id}` as Summary[];
  const summary=s[0] ?? {avg_progress:0,completed:0,tracked:0,best_score:null};
  const next=await sql`
    SELECT l.title,c.title AS course_title,coalesce(sp.progress_percent,0)::int AS progress_percent
    FROM lessons l JOIN courses c ON c.id=l.course_id
    LEFT JOIN student_progress sp ON sp.lesson_id=l.id AND sp.user_id=${user.id}
    WHERE c.is_published=true AND coalesce(sp.progress_percent,0)<100
    ORDER BY coalesce(sp.progress_percent,0) DESC,c.position,l.position LIMIT 3` as Lesson[];
  const live=await sql`SELECT title,starts_at FROM live_classes WHERE starts_at>now() ORDER BY starts_at LIMIT 1` as Live[];
  return <AppShell active="Dashboard" userName={user.full_name}><Topbar title={`Bonsoir ${user.full_name.split(' ')[0]} 👋`} subtitle="Continue ta préparation au Régional." userName={user.full_name}/><div className="stats"><div className="stat"><small>Progression suivie</small><strong>{summary.avg_progress}%</strong><div className="progressbar"><span style={{width:`${summary.avg_progress}%`}}/></div></div><div className="stat"><small>Leçons terminées</small><strong>{summary.completed}/{Math.max(summary.tracked,1)}</strong></div><div className="stat"><small>Meilleur score</small><strong>{summary.best_score ?? '—'}%</strong></div><div className="stat"><small>Prochain live</small><strong style={{fontSize:18}}>{live[0]?new Date(live[0].starts_at).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):'À venir'}</strong></div></div><div className="twoCol"><section className="card"><h3>Continuer là où tu t'es arrêté</h3><div className="courseList">{next.length?next.map((l,i)=><div className="course" key={`${l.course_title}-${l.title}`}><div className="courseNum">{String(i+1).padStart(2,'0')}</div><div className="courseText"><b>{l.title}</b><small>{l.course_title}</small></div><span className="pill">{l.progress_percent}%</span></div>):<p>Aucune leçon en attente.</p>}<div className="course"><div className="courseNum">R</div><div className="courseText"><b>Entraînement Régional</b><small>Sujets + correction</small></div><Link className="btn ghost" href="/regional">Ouvrir</Link></div></div></section><aside className="card"><h3>Prochain rendez-vous</h3>{live[0]?<><p style={{color:'var(--muted)'}}>{live[0].title}</p><strong style={{fontSize:28}}>{new Date(live[0].starts_at).toLocaleString('fr-FR',{day:'2-digit',month:'long',hour:'2-digit',minute:'2-digit'})}</strong><p><Link className="btn primary" href="/live">Voir le Live</Link></p></>:<p style={{color:'var(--muted)'}}>Aucun live programmé.</p>}</aside></div></AppShell>
}
