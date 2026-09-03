import Image from 'next/image';
import Link from 'next/link';
import { logoutAction } from './actions';

export function AppShell({children,active,userName='Yassine'}:{children:React.ReactNode,active:string,userName?:string}){
 const items=[['Dashboard','/dashboard'],['Cours','/courses'],['Régional','/regional'],['Live & Replays','/live'],['Progression','/progress']];
 return <div className="appShell"><aside className="sidebar"><div className="sideTop"><span className="logoMark">A</span><b>Prof Anis</b></div><div className="profileMini"><Image src="/prof-anis.jpg" alt="Prof Anis" width={50} height={50}/><div><b>Prof Anis Outikhsi</b><small>Français • 1BAC</small></div></div><nav className="menu">{items.map(([label,href])=><Link key={href} className={active===label?'active':''} href={href}>{label}</Link>)}<Link href="/">← Site public</Link><form action={logoutAction}><button className="menuButton" type="submit">Déconnexion</button></form></nav></aside><main className="main">{children}</main></div>
}
export function Topbar({title,subtitle,userName='Yassine'}:{title:string,subtitle:string,userName?:string}){return <div className="topbar"><div className="welcome"><h1>{title}</h1><p>{subtitle}</p></div><div className="avatar">{userName.charAt(0).toUpperCase()}</div></div>}
