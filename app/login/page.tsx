import Link from 'next/link';

export default function Login(){
 return <main className="loginPage"><div className="loginCard"><div className="brand"><span className="logoMark">A</span><span>Prof Anis</span></div><h1>Espace plateforme</h1><p>Connecte-toi pour continuer ta préparation.</p><form className="loginForm" action="/api/login" method="post"><input name="phone" className="input" placeholder="Numéro WhatsApp" defaultValue="+212600000101" required/><input name="password" className="input" type="password" placeholder="Mot de passe" defaultValue="Demo2026!" required/><button className="btn primary" type="submit">Se connecter</button></form><div className="demoHint"><b>Élève :</b> +212600000101 / Demo2026!<br/><b>Prof :</b> +212600000001 / AnisDemo2026!</div><p style={{marginTop:16}}><Link href="/">← Retour au site</Link></p></div></main>
}
