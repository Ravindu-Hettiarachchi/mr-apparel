import { ContentProvider } from '@/lib/content';
import SmoothScroll from '@/components/SmoothScroll';
import Nav from '@/components/Nav';
import { IntroProvider } from '@/components/Intro';
import Hero, { Categories } from '@/components/sections/Hero';
import { Marquee, Audiences, Garments, Materials, Quality, Process, Works, Testimonials, Faq } from '@/components/sections/Sections';
import Finishes from '@/components/sections/Finishes';
import Quote from '@/components/sections/Quote';
import Footer, { CtaBand, Fab } from '@/components/Footer';

export default function Home() {
  return (
    <ContentProvider>
      <IntroProvider>
      <SmoothScroll>
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <Categories />
          <Garments />
          <Works />
          <Finishes />
          <Materials />
          <Audiences />
          <Quality />
          <Process />
          <Testimonials />
          <Faq />
          <Quote />
          <CtaBand />
        </main>
        <Footer />
        <Fab />
      </SmoothScroll>
      </IntroProvider>
    </ContentProvider>
  );
}
