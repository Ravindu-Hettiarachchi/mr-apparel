'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollAnimations';
import { FaShoppingCart, FaArrowRight, FaSearch, FaStar } from 'react-icons/fa';
import styles from './store.module.css';

const categories = ['All', 'Crew Neck', 'Polo', 'V-Neck', 'Long Sleeve', 'Hoodie'];

const products = [
  {
    id: 1,
    name: 'Classic Crew Neck Tee',
    category: 'Crew Neck',
    price: 'LKR 1,500',
    colors: ['#000000', '#FFFFFF', '#1A1A5E', '#8B0000'],
    img: '/images/store-product.png',
    badge: 'Best Seller',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Premium Polo Shirt',
    category: 'Polo',
    price: 'LKR 2,200',
    colors: ['#000000', '#FFFFFF', '#1B3A4B'],
    img: '/images/corporate-banner.png',
    badge: 'New',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'V-Neck Essential',
    category: 'V-Neck',
    price: 'LKR 1,350',
    colors: ['#000000', '#FFFFFF', '#333333'],
    img: '/images/store-product.png',
    badge: null,
    rating: 4.6,
  },
  {
    id: 4,
    name: 'Long Sleeve Performance',
    category: 'Long Sleeve',
    price: 'LKR 1,800',
    colors: ['#000000', '#FFFFFF', '#2C2C2C'],
    img: '/images/store-product.png',
    badge: 'Popular',
    rating: 4.7,
  },
  {
    id: 5,
    name: 'Corporate Crew Tee',
    category: 'Crew Neck',
    price: 'LKR 1,600',
    colors: ['#000000', '#FFFFFF', '#1A1A5E', '#4A4A4A'],
    img: '/images/works-showcase.png',
    badge: null,
    rating: 4.5,
  },
  {
    id: 6,
    name: 'Executive Polo',
    category: 'Polo',
    price: 'LKR 2,500',
    colors: ['#000000', '#1B3A4B', '#8B0000'],
    img: '/images/corporate-banner.png',
    badge: 'Premium',
    rating: 5.0,
  },
  {
    id: 7,
    name: 'Urban Hoodie',
    category: 'Hoodie',
    price: 'LKR 3,200',
    colors: ['#000000', '#333333', '#FFFFFF'],
    img: '/images/store-product.png',
    badge: 'New',
    rating: 4.8,
  },
  {
    id: 8,
    name: 'Sport V-Neck',
    category: 'V-Neck',
    price: 'LKR 1,400',
    colors: ['#000000', '#FFFFFF', '#1A1A5E'],
    img: '/images/store-product.png',
    badge: null,
    rating: 4.4,
  },
];

export default function StorePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = products.filter((p) => {
    const matchCategory = activeFilter === 'All' || p.category === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      {/* Hero */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg}>
          <Image src="/images/store-product.png" alt="Store" fill style={{ objectFit: 'cover' }} />
          <div className={styles.pageHeroOverlay}></div>
        </div>
        <div className={styles.pageHeroContent}>
          <motion.span
            className="heading-sm text-gradient"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Collection
          </motion.span>
          <motion.h1
            className="heading-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Our <span className="text-gradient">Store</span>
          </motion.h1>
          <motion.p
            className="text-muted"
            style={{ fontSize: '1.15rem', maxWidth: '500px', marginTop: '16px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Browse our collection of blank apparel ready for your custom prints
          </motion.p>
        </div>
      </section>

      {/* Store */}
      <section className={`section ${styles.storeSection}`}>
        <div className="container">
          {/* Search & Filters */}
          <ScrollReveal>
            <div className={styles.storeToolbar}>
              <div className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
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
            </div>
          </ScrollReveal>

          {/* Products Grid */}
          <motion.div className={styles.productGrid} layout>
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className={styles.productCard}
                >
                  <div className={styles.productImageWrapper}>
                    <Image src={product.img} alt={product.name} fill style={{ objectFit: 'cover' }} />
                    {product.badge && (
                      <span className={styles.productBadge}>{product.badge}</span>
                    )}
                    <div className={styles.productActions}>
                      <Link href="/matching" className={styles.productQuickView}>
                        Match Colors <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productRating}>
                      <FaStar /> {product.rating}
                    </div>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.productMeta}>
                      <span className={styles.productPrice}>{product.price}</span>
                      <div className={styles.productColors}>
                        {product.colors.map((color, i) => (
                          <span
                            key={i}
                            className={styles.colorDot}
                            style={{ backgroundColor: color }}
                          ></span>
                        ))}
                      </div>
                    </div>
                    <Link href="/matching" className={styles.productBtn}>
                      <FaShoppingCart /> Match & Order
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
