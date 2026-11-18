import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';
import site from '@/content/site.json';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const display = Inter_Tight({ subsets: ['latin'], variable: '--font-display-face', display: 'swap', weight: ['500', '600', '700', '800'] });

const title = `${site.brand.name} — Custom Polo Shirts & T-Shirts for Corporates and Events`;

export const metadata = {
  metadataBase: new URL('https://mrapparel.pixbeelabs.com'),
  title,
  description: site.brand.description,
  keywords: [
    'custom polo shirts',
    'corporate t-shirts Sri Lanka',
    'event t-shirts',
    'embroidery',
    'DTF printing',
    'sublimation',
    'uniforms',
    'MR Apparel',
  ],
  openGraph: { title, description: site.brand.description, type: 'website', url: '/' },
  twitter: { card: 'summary_large_image', title, description: site.brand.description },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
