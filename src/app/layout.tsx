import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Stroop Route（ストループ・ルート） - 意色交差パズル',
  description:
    'ストループ効果（文字の意味とインク色の干渉）を一筆書きパズルに統合！前頭前野の抑制制御・認知的柔軟性・空間ワーキングメモリを鍛える新感覚脳トレWebアプリ。',
  keywords: [
    'ストループ効果',
    '脳トレ',
    'パズル',
    '一筆書き',
    'Stroop Route',
    '意色交差',
    'Next.js',
    'Webゲーム',
  ],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Stroop Route（ストループ・ルート） - 意色交差パズル',
    description:
      '文字の意味とインク色が交差する！脳のギアチェンジを強制する新感覚一筆書きパズル。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stroop Route - 意色交差パズル',
    description: 'ストループ効果×一筆書きの新感覚脳トレパズルゲーム！',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#030712',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
