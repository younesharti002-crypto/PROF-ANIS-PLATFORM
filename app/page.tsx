import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, PenLine, PlayCircle, Sparkles, Trophy } from 'lucide-react';
import { captureLead } from './actions';

export default function Home(){
  return <>
    <header className="container nav">
      <Link href="/" className="brand"><span className="logoMark">A</span><span>Prof Anis</span></Link>
      <nav className="navlinks"><a href="#programme">Programme</a><a href="#methode">Méthode</a><a href="#test">Test gratuit</a><Link href="/dashboard">Plateforme</Link></nav>
      <div className="actions"><Link className="btn ghost" href="/login">Connexion</Link><a className="btn primary" href="#test">Commencer <ArrowRight size={16}/></a></div>
    </header>
    <main>
      <section className="container hero">
        <div>
          <div className="eyebrow"><Sparkles size={15}/> Français 1BAC • Examen Régional</div>
          <h1><span className="gradient">Prépare ton Régional de Français</span><br/>avec méthode et confiance.</h1>
          <p>Cours structurés, œuvres, production écrite, examens régionaux, lives et suivi de progression avec <b>Prof Anis Outikhsi</b>.</p>
          <div className="heroBtns"><a className="btn primary" href="#test">Faire le test gratuit <ArrowRight size={17}/></a><Link className="btn ghost" href="/dashboard"><PlayCircle size={17}/> Voir la plateforme</Link></div>
          <div className="trust"><span><CheckCircle2 size={16}/> 1ère Bac</span><span><CheckCircle2 size={16}/> Présentiel & à distance</span><span><CheckCircle2 size={16}/> Préparation Régional</span></div>
        </div>
        <div className="portraitWrap">
          <div className="portraitCard"><Image src="/prof-anis.jpg" alt="Prof Anis Outikhsi" width={760} height={760} priority/></div>
          <div className="floating"><small>Objectif</small><strong>Régional 1BAC</strong><small>Comprendre • S'entraîner • Progresser</small></div>
        </div>
      </section>

      <section className="section" id="programme"><div className="container">
        <div className="sectionTitle"><div className="eyebrow">Un parcours complet</div><h2>Tout ce qu'il faut pour avancer, au même endroit.</h2><p>Une préparation pensée autour des difficultés réelles de l'élève de 1ère Bac.</p></div>
        <div className="grid3">
          <div className="card"><div className="cardIcon"><BookOpen/></div><h3>Les œuvres</h3><p>Comprendre les œuvres, personnages, thèmes, chapitres et passages essentiels.</p></div>
          <div className="card"><div className="cardIcon"><PenLine/></div><h3>Production écrite</h3><p>Méthode, plans, arguments, sujets guidés et entraînement progressif.</p></div>
          <div className="card"><div className="cardIcon"><Trophy/></div><h3>Examens régionaux</h3><p>Sujets d'entraînement, chronomètre, correction et suivi des résultats.</p></div>
        </div>
      </div></section>

      <section className="section" id="methode"><div className="container">
        <div className="sectionTitle"><div className="eyebrow">La méthode</div><h2>Pas juste regarder des vidéos. Apprendre avec un parcours.</h2></div>
        <div className="grid3">
          <div className="card"><div className="cardIcon"><PlayCircle/></div><h3>1. Comprendre</h3><p>Une explication claire et structurée avant de passer aux exercices.</p></div>
          <div className="card"><div className="cardIcon"><GraduationCap/></div><h3>2. S'entraîner</h3><p>Quiz, exercices, production écrite et sujets de régional.</p></div>
          <div className="card"><div className="cardIcon"><Trophy/></div><h3>3. Mesurer</h3><p>Un tableau de bord montre la progression et les parties à retravailler.</p></div>
        </div>
      </div></section>

      <section className="section" id="test"><div className="container leadBox">
        <div><div className="eyebrow">🎁 Diagnostic gratuit</div><h2>واش واجد للجهوي ديال Français؟</h2><p style={{color:'var(--muted)'}}>دير اختبار قصير وخذ صورة أولية على مستواك فـ compréhension، langue، œuvres و production écrite.</p></div>
        <form className="form" action={captureLead}><input name="full_name" className="input" placeholder="Prénom et nom" required/><input name="phone" className="input" placeholder="WhatsApp" required/><select name="level" className="input" defaultValue="1BAC"><option value="1BAC">1ère Bac</option><option value="2BAC">2ème Bac</option><option value="OTHER">Autre niveau</option></select><button type="submit" className="btn primary">Commencer le test <ArrowRight size={17}/></button><div className="fine">Tes informations servent uniquement à te recontacter au sujet de la préparation.</div></form>
      </div></section>
    </main>
    <footer className="footer"><div className="container">© 2026 Prof Anis Outikhsi • Français 1BAC • Casablanca & à distance</div></footer>
  </>
}
