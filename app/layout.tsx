import type { Metadata, Viewport } from "next";
// next/font/google télécharge les fonts au build et les auto-héberge :
// aucune requête vers Google en prod, pas de flash de police (FOUT).
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Police principale (titres + texte). On l'expose via une CSS variable
// --font-sans que Tailwind consomme dans fontFamily.sans (voir tailwind.config.ts).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Police mono (chiffres, temps, distances, données techniques).
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trail Plan",
  description: "Suivi d'entraînement trail running",
};

// App mobile-first : viewport device-width. themeColor = couleur de la barre
// du navigateur mobile (charbon).
export const viewport: Viewport = {
  themeColor: "#0B0A07",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang="fr" + class="dark" : l'app est dark-only (thème charbon/lime).
    // Les deux variables de fonts sont injectées sur <html> pour être dispo partout.
    <html
      lang="fr"
      className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
