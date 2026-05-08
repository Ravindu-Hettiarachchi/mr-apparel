import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'MR Apparel | Designed to Be Different',
  description: 'MR Apparel — Designed to Be Different. Premium custom clothing, corporate t-shirts, DTF printing, and sublimation. Elevate your brand with high-quality custom apparel.',
  keywords: 'custom t-shirts, corporate clothing, DTF printing, sublimation, custom apparel, branded uniforms, Sri Lanka',
  openGraph: {
    title: 'MR Apparel | Designed to Be Different',
    description: 'Premium custom t-shirts, DTF prints, and sublimation apparel — Designed to Be Different.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="grain-overlay">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
