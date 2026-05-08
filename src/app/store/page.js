'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ScrollAnimations';
import {
  FaShoppingCart, FaSearch, FaStar, FaPlus, FaMinus,
  FaTimes, FaWhatsapp, FaTrash, FaArrowRight,
} from 'react-icons/fa';
import styles from './store.module.css';

/* ============================
   PRODUCT DATA
   ============================ */
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const products = [
  {
    id: 1,
    name: 'Classic Crew Neck Tee',
    category: 'Crew Neck',
    price: 1500,
    colors: [
      { name: 'Black',     hex: '#111111' },
      { name: 'White',     hex: '#F5F5F5' },
      { name: 'Navy',      hex: '#1A1A5E' },
      { name: 'Burgundy',  hex: '#8B0000' },
    ],
    img: '/images/store-product.png',
    badge: 'Best Seller',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Premium Polo Shirt',
    category: 'Polo',
    price: 2200,
    colors: [
      { name: 'Black',     hex: '#111111' },
      { name: 'White',     hex: '#F5F5F5' },
      { name: 'Navy',      hex: '#1B3A4B' },
    ],
    img: '/images/corporate-banner.png',
    badge: 'New',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'V-Neck Essential',
    category: 'V-Neck',
    price: 1350,
    colors: [
      { name: 'Black',     hex: '#111111' },
      { name: 'White',     hex: '#F5F5F5' },
      { name: 'Charcoal',  hex: '#333333' },
    ],
    img: '/images/store-product.png',
    badge: null,
    rating: 4.6,
  },
  {
    id: 4,
    name: 'Long Sleeve Performance',
    category: 'Long Sleeve',
    price: 1800,
    colors: [
      { name: 'Black',     hex: '#111111' },
      { name: 'White',     hex: '#F5F5F5' },
      { name: 'Charcoal',  hex: '#2C2C2C' },
    ],
    img: '/images/store-product.png',
    badge: 'Popular',
    rating: 4.7,
  },
  {
    id: 5,
    name: 'Corporate Crew Tee',
    category: 'Crew Neck',
    price: 1600,
    colors: [
      { name: 'Black',     hex: '#111111' },
      { name: 'White',     hex: '#F5F5F5' },
      { name: 'Navy',      hex: '#1A1A5E' },
      { name: 'Slate',     hex: '#4A4A4A' },
    ],
    img: '/images/works-showcase.png',
    badge: null,
    rating: 4.5,
  },
  {
    id: 6,
    name: 'Executive Polo',
    category: 'Polo',
    price: 2500,
    colors: [
      { name: 'Black',     hex: '#111111' },
      { name: 'Navy',      hex: '#1B3A4B' },
      { name: 'Burgundy',  hex: '#8B0000' },
    ],
    img: '/images/corporate-banner.png',
    badge: 'Premium',
    rating: 5.0,
  },
  {
    id: 7,
    name: 'Urban Hoodie',
    category: 'Hoodie',
    price: 3200,
    colors: [
      { name: 'Black',     hex: '#111111' },
      { name: 'Charcoal',  hex: '#333333' },
      { name: 'White',     hex: '#F5F5F5' },
    ],
    img: '/images/store-product.png',
    badge: 'New',
    rating: 4.8,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 8,
    name: 'Sport V-Neck',
    category: 'V-Neck',
    price: 1400,
    colors: [
      { name: 'Black',     hex: '#111111' },
      { name: 'White',     hex: '#F5F5F5' },
      { name: 'Navy',      hex: '#1A1A5E' },
    ],
    img: '/images/store-product.png',
    badge: null,
    rating: 4.4,
  },
];

const CATEGORIES = ['All', 'Crew Neck', 'Polo', 'V-Neck', 'Long Sleeve', 'Hoodie'];
const WA_NUMBER  = '94704909218';

function fmtLKR(n) {
  return 'LKR ' + Number(n).toLocaleString('en-LK');
}

/* ============================
   PRODUCT CARD
   ============================ */
function ProductCard({ product, onAddToCart }) {
  const sizes = product.sizes || SIZES;
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize,  setSelectedSize]  = useState('M');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart({ ...product, selectedColor, selectedSize });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className={styles.productCard}>
      {/* Image */}
      <div className={styles.productImageWrapper}>
        <Image src={product.img} alt={product.name} fill style={{ objectFit: 'cover' }} />
        {product.badge && (
          <span className={styles.productBadge}>{product.badge}</span>
        )}
      </div>

      {/* Info */}
      <div className={styles.productInfo}>
        <div className={styles.productRating}>
          <FaStar /> {product.rating}
        </div>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productPrice}>{fmtLKR(product.price)}</p>

        {/* Color picker */}
        <div className={styles.colorRow}>
          <span className={styles.colorLabel}>
            Color: <strong>{selectedColor.name}</strong>
          </span>
          <div className={styles.colorDots}>
            {product.colors.map((c) => (
              <button
                key={c.hex}
                className={`${styles.colorDot} ${selectedColor.hex === c.hex ? styles.colorDotActive : ''}`}
                style={{ background: c.hex }}
                title={c.name}
                onClick={() => setSelectedColor(c)}
              />
            ))}
          </div>
        </div>

        {/* Size picker */}
        <div className={styles.sizeRow}>
          <span className={styles.sizeLabel}>Size:</span>
          <div className={styles.sizeBtns}>
            {sizes.map((s) => (
              <button
                key={s}
                className={`${styles.sizeBtn} ${selectedSize === s ? styles.sizeBtnActive : ''}`}
                onClick={() => setSelectedSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Add to cart */}
        <button
          className={`${styles.addToCartBtn} ${added ? styles.addedBtn : ''}`}
          onClick={handleAdd}
        >
          {added ? (
            <><FaStar /> Added!</>
          ) : (
            <><FaShoppingCart /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ============================
   CART DRAWER
   ============================ */
function CartDrawer({ cart, onClose, onRemove, onUpdateQty }) {
  const total     = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty  = cart.reduce((s, i) => s + i.qty, 0);

  const waMessage = encodeURIComponent(
    `Hi MR Apparel! I'd like to place the following order:\n\n` +
    cart.map((item) =>
      `- ${item.name} | Color: ${item.selectedColor.name} | Size: ${item.selectedSize} | Qty: ${item.qty} | ${fmtLKR(item.price)}/pc`
    ).join('\n') +
    `\n\nTotal items: ${totalQty} pieces` +
    `\nEstimated total: ${fmtLKR(total)}` +
    `\n\nPlease confirm availability and final price. Thank you!`
  );

  return (
    <motion.div
      className={styles.cartOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.cartDrawer}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.cartHeader}>
          <div>
            <h3 className={styles.cartTitle}>Your Cart</h3>
            <span className={styles.cartCount}>{totalQty} item{totalQty !== 1 ? 's' : ''}</span>
          </div>
          <button className={styles.cartClose} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Items */}
        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div className={styles.cartEmpty}>
              <FaShoppingCart className={styles.cartEmptyIcon} />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <motion.div
                key={idx}
                className={styles.cartItem}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
              >
                <div className={styles.cartItemImg}>
                  <Image src={item.img} alt={item.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className={styles.cartItemInfo}>
                  <p className={styles.cartItemName}>{item.name}</p>
                  <div className={styles.cartItemMeta}>
                    <span
                      className={styles.cartItemColor}
                      style={{ background: item.selectedColor.hex }}
                    />
                    <span className={styles.cartItemSize}>{item.selectedSize}</span>
                  </div>
                  <div className={styles.cartItemBottom}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => onUpdateQty(idx, item.qty - 1)}><FaMinus /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => onUpdateQty(idx, item.qty + 1)}><FaPlus /></button>
                    </div>
                    <span className={styles.cartItemPrice}>{fmtLKR(item.price * item.qty)}</span>
                  </div>
                </div>
                <button className={styles.cartItemRemove} onClick={() => onRemove(idx)}>
                  <FaTrash />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.cartTotal}>
              <span>Estimated Total</span>
              <span className={styles.cartTotalValue}>{fmtLKR(total)}</span>
            </div>
            <p className={styles.cartNote}>
              Final price confirmed after design and quantity review.
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waOrderBtn}
            >
              <FaWhatsapp /> Order via WhatsApp
            </a>
            <button className={styles.continueBtn} onClick={onClose}>
              Continue Shopping <FaArrowRight />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ============================
   MAIN PAGE
   ============================ */
export default function StorePage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [cart,         setCart]         = useState([]);
  const [cartOpen,     setCartOpen]     = useState(false);

  const totalCartQty = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = products.filter((p) => {
    const matchCat    = activeFilter === 'All' || p.category === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.id === item.id && i.selectedColor.hex === item.selectedColor.hex && i.selectedSize === item.selectedSize
      );
      if (idx > -1) {
        return prev.map((i, index) => index === idx ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const handleRemove = (idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateQty = (idx, qty) => {
    if (qty < 1) return handleRemove(idx);
    setCart((prev) => prev.map((item, i) => i === idx ? { ...item, qty } : item));
  };

  return (
    <>
      {/* ======= HERO ======= */}
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
            Browse our collection — pick your color, size, and order via WhatsApp
          </motion.p>
        </div>
      </section>

      {/* ======= STORE SECTION ======= */}
      <section className={`section ${styles.storeSection}`}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.storeToolbar}>
              {/* Search */}
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

              {/* Filters */}
              <div className={styles.filterBar}>
                {CATEGORIES.map((cat) => (
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

          {/* Product Grid */}
          <motion.div className={styles.productGrid} layout>
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <p>No products match your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* ======= FLOATING CART BUTTON ======= */}
      <AnimatePresence>
        {totalCartQty > 0 && !cartOpen && (
          <motion.button
            className={styles.floatingCart}
            onClick={() => setCartOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaShoppingCart />
            <span className={styles.floatingCartBadge}>{totalCartQty}</span>
            <span className={styles.floatingCartLabel}>View Cart</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ======= CART DRAWER ======= */}
      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            cart={cart}
            onClose={() => setCartOpen(false)}
            onRemove={handleRemove}
            onUpdateQty={handleUpdateQty}
          />
        )}
      </AnimatePresence>
    </>
  );
}
