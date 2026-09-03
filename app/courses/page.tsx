import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell, Topbar } from '../components';
export const dynamic='force-dynamic';

type CourseRow={id:string;title:string;description:string|null;lesson_count:number;avg_progress:number};

export default async function Courses(){
  const user=await requireUser();
  const sql=db();
  const courses=await sql`
    SELECT c.id,c.title,c.description,
      count(l.id)::int AS lesson_count,
      coalesce(round(avg(sp.progress_percent))::int,0) AS avg_progress
    FROM courses c
    LEFT JOIN lessons l ON l.course_id=c.id
    LEFT JOIN student_progress sp ON sp.lesson_id=l.id AND sp.user_id=${user.id}
    WHERE c.is_published=true
    GROUP BY c.id,c.title,c.description,c.position
    ORDER BY c.position,c.title` as CourseRow[];
  return <AppShell active="Cours" userName={user.full_name}><Topbar title="Mes cours" subtitle="Les contenus viennent maintenant directement de la base de données." userName={user.full_name}/><div className="grid3">{courses.map(c=><div className="card" key={c.id}><div className="cardIcon">FR</div><h3>{c.title}</h3><p>{c.description}</p><small>{c.lesson_count} leçon{c.lesson_count>1?'s':''}</small><div className="progressbar" style={{marginTop:14}}><span style={{width:`${c.avg_progress}%`}}/></div><div style={{marginTop:10,fontWeight:800}}>{c.avg_progress}%</div></div>)}</div></AppShell>
}
