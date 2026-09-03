import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prof Anis Outikhsi | Français 1BAC & Régional',
  description: 'Cours de français 1BAC, œuvres, production écrite, examens régionaux, lives et suivi de progression avec Prof Anis Outikhsi.',
  keywords: ['Prof Anis Outikhsi','Français 1BAC','examen régional','La Boîte à Merveilles','Antigone','Casablanca'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
