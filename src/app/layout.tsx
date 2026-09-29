import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'BRICS CivicPulse | AI for Digital Public Infrastructure & Governance',
  description: 'Multilingual AI-assisted Digital Public Good turning citizen voice into defensible public infrastructure investment across BRICS member states.',
  keywords: ['BRICS', 'CivicPulse', 'Digital Public Infrastructure', 'GovTech', 'AI Governance', 'Urban Planning', 'Public Investment'],
  authors: [{ name: 'BRICS Innovation Track 1' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#fbf7f0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#fbf7f0] text-stone-900 flex flex-col min-h-screen antialiased selection:bg-orange-500 selection:text-white overflow-x-hidden w-full max-w-full">
        <LanguageProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1 w-full max-w-full overflow-x-hidden">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
