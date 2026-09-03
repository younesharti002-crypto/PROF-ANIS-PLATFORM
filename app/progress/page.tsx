import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell, Topbar } from '../components';
export const dynamic='force-dynamic';

type Row={title:string;progress:number;score:number|null};

export default async function Progress(){
  const user=await requireUser();
  const sql=db();
  const rows=await sql`
    SELECT c.title,coalesce(round(avg(sp.progress_percent))::int,0) AS progress,
      max(sp.score)::int AS score
    FROM courses c
    LEFT JOIN lessons l ON l.course_id=c.id
    LEFT JOIN student_progress sp ON sp.lesson_id=l.id AND sp.user_id=${user.id}
    WHERE c.is_published=true
    GROUP BY c.id,c.title,c.position ORDER BY c.position` as Row[];
  const priority=[...rows].filter(r=>r.progress>0).sort((a,b)=>a.progress-b.progress)[0];
  return <AppShell active="Progression" userName={user.full_name}><Topbar title="Ma progression" subtitle="Données calculées à partir des activités réellement enregistrées." userName={user.full_name}/><section className="card"><h3>Progression par parcours</h3><div className="courseList">{rows.map(r=><div className="course" key={r.title}><div className="courseText"><b>{r.title}</b><div className="progressbar"><span style={{width:`${r.progress}%`}}/></div></div><strong>{r.progress}%</strong></div>)}</div></section><section className="card" style={{marginTop:18}}><h3>Priorité actuelle</h3><p style={{color:'var(--muted)'}}>{priority?`${priority.title} — basé uniquement sur les activités enregistrées dans la plateforme.`:'Commence une première leçon pour afficher une priorité.'}</p></section></AppShell>
}
