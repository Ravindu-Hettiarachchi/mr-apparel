import { ContentProvider } from '@/lib/content';
import SmoothScroll from '@/components/SmoothScroll';
import Nav from '@/components/Nav';
import Hero from '@/components/sections/Hero';
import { Marquee, Audiences, Garments, Materials, Techniques, Quality, Process, Works, Testimonials, Faq } from '@/components/sections/Sections';
import Studio from '@/components/sections/Studio';
import Quote from '@/components/sections/Quote';
import Footer, { CtaBand, Fab } from '@/components/Footer';

export default function Home() {
  return (
    <ContentProvider>
      <SmoothScroll>
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <Works />
          <Audiences />
          <Garments />
          <Materials />
          <Techniques />
          <Quality />
          <Studio />
          <Process />
          <Testimonials />
          <Faq />
          <Quote />
          <CtaBand />
        </main>
        <Footer />
        <Fab />
      </SmoothScroll>
    </ContentProvider>
  );
}
