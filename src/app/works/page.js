'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollAnimations';
import { FaArrowRight, FaTimes } from 'react-icons/fa';
import styles from './works.module.css';

const categories = ['All', 'DTF Printing', 'Sublimation', 'Corporate', 'Events'];

const projects = [
  {
    id: 1,
    img: '/images/works-showcase.png',
    title: 'Urban Streetwear Collection',
    category: 'DTF Printing',
    desc: 'Custom DTF prints featuring vibrant urban art designs for a streetwear brand launch.',
  },
  {
    id: 2,
    img: '/images/sublimation-showcase.png',
    title: 'The Infinite Print Series',
    category: 'Sublimation',
    desc: 'Full all-over sublimation prints with intricate patterns and vibrant colors.',
  },
  {
    id: 3,
    img: '/images/corporate-banner.png',
    title: 'Executive Uniform Program',
    category: 'Corporate',
    desc: 'Premium corporate branding package with embroidered polos and branded t-shirts.',
  },
  {
    id: 4,
    img: '/images/dtf-process.png',
    title: 'Art Festival Merchandise',
    category: 'Events',
    desc: 'Limited edition event merchandise with custom artwork and bold color palettes.',
  },
  {
    id: 5,
    img: '/images/hero-banner.png',
    title: 'Tech Startup Team Wear',
    category: 'Corporate',
    desc: 'Modern, sleek branded apparel for a fast-growing technology company.',
  },
  {
    id: 6,
    img: '/images/store-product.png',
    title: 'Retail Brand Launch',
    category: 'DTF Printing',
    desc: 'Complete retail collection with DTF printed tees in multiple colorways.',
  },
  {
    id: 7,
    img: '/images/sublimation-showcase.png',
    title: 'Sports Team Jerseys',
    category: 'Sublimation',
    desc: 'High-performance sublimated sports jerseys with moisture-wicking fabric.',
  },
  {
    id: 8,
    img: '/images/works-showcase.png',
    title: 'Music Festival Merch',
    category: 'Events',
    desc: 'Eye-catching festival merchandise with glow-in-the-dark and neon DTF prints.',
  },
  {
    id: 9,
    img: '/images/corporate-banner.png',
    title: 'Hotel Staff Uniforms',
    category: 'Corporate',
    desc: 'Elegant and professional hotel staff uniforms with subtle branding.',
  },
];

export default function WorksPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <>
      {/* Hero Banner */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg}>
          <Image src="/images/works-showcase.png" alt="Our works" fill style={{ objectFit: 'cover' }} />
          <div className={styles.pageHeroOverlay}></div>
        </div>
        <div className={styles.pageHeroContent}>
          <motion.span
            className="heading-sm text-gradient"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Portfolio
          </motion.span>
          <motion.h1
            className="heading-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Our <span className="text-gradient">Works</span>
          </motion.h1>
          <motion.p
            className="text-muted"
            style={{ fontSize: '1.15rem', maxWidth: '500px', marginTop: '16px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Explore our portfolio of premium custom apparel projects
          </motion.p>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className={`section ${styles.worksSection}`}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.filterBar}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterActive : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <motion.div className={styles.projectGrid} layout>
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className={styles.projectCard}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className={styles.projectImage}>
                    <Image src={project.img} alt={project.title} fill style={{ objectFit: 'cover' }} />
                    <div className={styles.projectOverlay}>
                      <span className={styles.projectCat}>{project.category}</span>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <div className={styles.projectViewBtn}>
                        View Details <FaArrowRight />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.lightboxClose} onClick={() => setSelectedProject(null)}>
                <FaTimes />
              </button>
              <div className={styles.lightboxImage}>
                <Image
                  src={selectedProject.img}
                  alt={selectedProject.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.lightboxInfo}>
                <span className={styles.projectCat}>{selectedProject.category}</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px' }}>
                  {selectedProject.title}
                </h2>
                <p className="text-muted" style={{ marginTop: '12px', lineHeight: '1.7' }}>
                  {selectedProject.desc}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
