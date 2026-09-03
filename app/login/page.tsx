export const dynamic = 'force-static';

export default function LoginPage() {
  return (
    <main className="loginPage">
      <div className="loginCard">
        <div className="brand">
          <span className="logoMark">A</span>
          <span>Prof Anis</span>
        </div>
        <h1>Espace plateforme</h1>
        <p>Connecte-toi pour continuer ta préparation.</p>
        <form className="loginForm" action="/api/login" method="post">
          <input name="phone" className="input" placeholder="Numéro WhatsApp" required />
          <input name="password" className="input" type="password" placeholder="Mot de passe" required />
          <button className="btn primary" type="submit">Se connecter</button>
        </form>
        <p style={{ marginTop: 16 }}><a href="/">← Retour au site</a></p>
      </div>
    </main>
  );
}
