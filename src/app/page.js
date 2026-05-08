'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  CountUp,
  MagneticButton,
} from '@/components/ScrollAnimations';
import { FaArrowRight, FaTshirt, FaPaintBrush, FaCubes, FaStar, FaQuoteLeft } from 'react-icons/fa';
import styles from './page.module.css';

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const services = [
    {
      icon: <FaTshirt />,
      title: 'Corporate T-Shirts',
      desc: 'Professional branded apparel for your team. From polo shirts to crew necks, we deliver premium quality with your corporate identity.',
    },
    {
      icon: <FaPaintBrush />,
      title: 'DTF Printing',
      desc: 'Direct-to-Film printing technology for vibrant, durable designs. Perfect for complex artwork and photographic prints.',
    },
    {
      icon: <FaCubes />,
      title: 'Sublimation',
      desc: 'Full-coverage sublimation printing for all-over designs. Unlimited colors, exceptional durability, and seamless edge-to-edge prints.',
    },
  ];

  const stats = [
    { value: 500, suffix: '+', label: 'Projects Delivered' },
    { value: 50, suffix: '+', label: 'Corporate Clients' },
    { value: 10000, suffix: '+', label: 'T-Shirts Printed' },
    { value: 99, suffix: '%', label: 'Client Satisfaction' },
  ];

  const testimonials = [
    {
      quote: "MR Apparel transformed our brand image. The quality of the DTF prints is outstanding and our team loves wearing them every day.",
      name: 'Sarah Chen',
      role: 'Marketing Director, TechCorp',
      rating: 5,
    },
    {
      quote: "We ordered 500 sublimation tees for our company retreat. The colors were vibrant and the delivery was right on time. Highly recommend!",
      name: 'James Wilson',
      role: 'HR Manager, InnovateLK',
      rating: 5,
    },
    {
      quote: "The Design Matching Tool is a game-changer. We could instantly see which garment colors complemented our logo before committing. Premium service all around.",
      name: 'Priya Fernando',
      role: 'Brand Strategist, CreativeHub',
      rating: 5,
    },
  ];

  return (
    <>
      {/* ======= HERO SECTION ======= */}
      <section className={styles.hero} ref={heroRef}>
        <motion.div className={styles.heroBgWrapper} style={{ scale: heroScale }}>
          <Image
            src="/images/hero-banner.png"
            alt="Corporate team in custom branded t-shirts"
            fill
            priority
            quality={90}
            style={{ objectFit: 'cover' }}
          />
          <div className={styles.heroOverlay}></div>
        </motion.div>

        <motion.div className={styles.heroContent} style={{ opacity: heroOpacity }}>
          <motion.div
            className={styles.heroBadge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className={styles.heroBadgeDot}></span>
            Designed to Be Different
          </motion.div>

          <motion.h1
            className="heading-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Wear Your
            <br />
            <span className="text-gradient">Brand Story</span>
          </motion.h1>

          <motion.p
            className={styles.heroSubtext}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            Premium corporate t-shirts, DTF prints, and sublimation apparel
            crafted to elevate your brand identity. From design to delivery, we make it seamless.
          </motion.p>

          <motion.div
            className={styles.heroActions}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <MagneticButton>
              <Link href="/matching" className="btn btn-primary btn-lg">
                Match Your Colors
                <FaArrowRight />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link href="/works" className="btn btn-outline btn-lg">
                View Our Work
              </Link>
            </MagneticButton>
          </motion.div>

          <motion.div
            className={styles.heroScroll}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div className={styles.scrollIndicator}>
              <div className={styles.scrollDot}></div>
            </div>
            <span>Scroll to explore</span>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className={styles.floatingShape1}
          animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={styles.floatingShape2}
          animate={{ y: [10, -10, 10], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </section>

      {/* ======= MARQUEE BAND ======= */}
      <section className={styles.marqueeSection}>
        <div className={styles.marqueeTrack}>
          <div className={styles.marqueeContent}>
            {[...Array(3)].map((_, i) => (
              <span key={i}>
                CORPORATE TEES ✦ DTF PRINTING ✦ SUBLIMATION ✦ CUSTOM DESIGNS ✦ BULK ORDERS ✦ BRAND IDENTITY ✦{' '}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ======= SERVICES SECTION ======= */}
      <section className={`section ${styles.servicesSection}`}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <span className="heading-sm text-gradient">What We Do</span>
              <h2 className="heading-lg" style={{ marginTop: '12px' }}>
                Printing Solutions That
                <br />
                <span className="text-gradient">Stand Out</span>
              </h2>
              <p className="text-muted" style={{ maxWidth: '600px', marginTop: '16px', fontSize: '1.1rem' }}>
                From corporate uniforms to event merchandise, we bring your vision to life
                with cutting-edge printing technology and premium materials.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className={styles.servicesGrid}>
            {services.map((service, i) => (
              <StaggerItem key={i}>
                <div className={`card ${styles.serviceCard}`}>
                  <div className={styles.serviceIcon}>{service.icon}</div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDesc}>{service.desc}</p>
                  <Link href="/store" className={styles.serviceLink}>
                    Learn More <FaArrowRight />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ======= SHOWCASE BANNER ======= */}
      <section className={styles.showcaseSection}>
        <div className={styles.showcaseGrid}>
          <ScrollReveal direction="left" className={styles.showcaseImage}>
            <Image
              src="/images/dtf-process.png"
              alt="DTF printing process"
              fill
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.showcaseImageOverlay}>
              <span className="heading-sm">DTF Printing</span>
              <p>Precision meets vibrance</p>
            </div>
          </ScrollReveal>

          <div className={styles.showcaseContent}>
            <ScrollReveal>
              <span className="heading-sm text-gradient">Our Craft</span>
              <h2 className="heading-lg" style={{ marginTop: '12px' }}>
                Precision In Every
                <br />
                <span className="text-gradient">Single Print</span>
              </h2>
              <p className="text-muted" style={{ marginTop: '20px', fontSize: '1.05rem', lineHeight: '1.8' }}>
                We don&apos;t just print t-shirts — we craft wearable art. Our state-of-the-art
                DTF and sublimation technology ensures every detail of your design is captured
                with stunning accuracy and durability.
              </p>

              <div className={styles.featureList}>
                {[
                  'Vibrant, fade-resistant colors',
                  'Soft-touch, breathable prints',
                  'No minimum order quantity',
                  'Fast turnaround times',
                ].map((feat, i) => (
                  <div key={i} className={styles.featureItem}>
                    <div className={styles.featureCheck}>✓</div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <MagneticButton>
                <Link href="/contact" className="btn btn-primary" style={{ marginTop: '32px' }}>
                  Get a Quote <FaArrowRight />
                </Link>
              </MagneticButton>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ======= STATS SECTION ======= */}
      <section className={`section ${styles.statsSection}`}>
        <div className={styles.statsGlow}></div>
        <div className="container">
          <StaggerContainer className={styles.statsGrid}>
            {stats.map((stat, i) => (
              <StaggerItem key={i}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ======= WORKS PREVIEW ======= */}
      <section className={`section ${styles.worksPreview}`}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <span className="heading-sm text-gradient">Portfolio</span>
              <h2 className="heading-lg" style={{ marginTop: '12px' }}>
                Our Recent <span className="text-gradient">Works</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className={styles.worksGrid}>
            {[
              { img: '/images/works-showcase.png', title: 'DTF Collection', cat: 'DTF Printing' },
              { img: '/images/sublimation-showcase.png', title: 'Sublimation Series', cat: 'Sublimation' },
              { img: '/images/corporate-banner.png', title: 'Corporate Uniforms', cat: 'Corporate' },
            ].map((work, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className={styles.workCard}>
                  <div className={styles.workImage}>
                    <Image src={work.img} alt={work.title} fill style={{ objectFit: 'cover' }} />
                    <div className={styles.workOverlay}>
                      <span className={styles.workCat}>{work.cat}</span>
                      <h3 className={styles.workTitle}>{work.title}</h3>
                      <Link href="/works" className={styles.workLink}>
                        View Project <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <MagneticButton>
                <Link href="/works" className="btn btn-outline">
                  View All Projects <FaArrowRight />
                </Link>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ======= CTA BANNER ======= */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBg}>
          <Image
            src="/images/store-product.png"
            alt="Custom apparel collection"
            fill
            style={{ objectFit: 'cover' }}
          />
          <div className={styles.ctaOverlay}></div>
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <ScrollReveal>
            <div className={styles.ctaContent}>
              <h2 className="heading-lg">
                Find Your Perfect <span className="text-gradient">Color Match</span>
              </h2>
              <p className="text-muted" style={{ fontSize: '1.15rem', maxWidth: '550px', margin: '20px auto 0' }}>
                Upload your logo or artwork and instantly discover the best garment colors
                and print method for your design — designed to be different.
              </p>
              <div style={{ marginTop: '36px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <MagneticButton>
                  <Link href="/matching" className="btn btn-primary btn-lg">
                    Try Matching Tool <FaArrowRight />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link href="/store" className="btn btn-ghost btn-lg">
                    Browse Store
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ======= TESTIMONIALS ======= */}
      <section className={`section ${styles.testimonialsSection}`}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <span className="heading-sm text-gradient">Testimonials</span>
              <h2 className="heading-lg" style={{ marginTop: '12px' }}>
                What Our <span className="text-gradient">Clients Say</span>
              </h2>
            </div>
          </ScrollReveal>

          <StaggerContainer className={styles.testimonialGrid}>
            {testimonials.map((test, i) => (
              <StaggerItem key={i}>
                <div className={`card-glass ${styles.testimonialCard}`}>
                  <FaQuoteLeft className={styles.quoteIcon} />
                  <p className={styles.testimonialText}>{test.quote}</p>
                  <div className={styles.testimonialStars}>
                    {[...Array(test.rating)].map((_, j) => (
                      <FaStar key={j} />
                    ))}
                  </div>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar}>
                      {test.name.charAt(0)}
                    </div>
                    <div>
                      <h4>{test.name}</h4>
                      <span>{test.role}</span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </>
  );
}
