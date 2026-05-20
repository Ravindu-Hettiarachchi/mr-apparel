'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock, FaArrowRight, FaGoogle, FaEnvelope, FaChevronRight } from 'react-icons/fa';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // If user is already logged in, redirect them to dashboard
    const user = localStorage.getItem('mr_apparel_user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    // Simulate network latency
    setTimeout(() => {
      setIsLoading(false);
      
      // Basic login checks for custom details
      if (email === 'john@calidi.com' || email === 'customer') {
        const userData = {
          name: 'John Doe',
          email: 'john@calidi.com',
          role: 'customer',
          tier: 'Gold VIP Member',
          points: 750,
          joined: 'Oct 2025'
        };
        localStorage.setItem('mr_apparel_user', JSON.stringify(userData));
        window.dispatchEvent(new Event('auth_state_change'));
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 800);
      } else if (email === 'admin@calidi.com' || email === 'admin') {
        const userData = {
          name: 'Ruwan Silva',
          email: 'admin@calidi.com',
          role: 'admin',
          tier: 'Super Admin',
          points: 9999,
          joined: 'Jan 2024'
        };
        localStorage.setItem('mr_apparel_user', JSON.stringify(userData));
        window.dispatchEvent(new Event('auth_state_change'));
        setSuccess('Admin login successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 800);
      } else {
        // Fallback for custom credentials
        const namePart = email.split('@')[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const userData = {
          name: formattedName || 'Customer Client',
          email: email,
          role: 'customer',
          tier: 'Bronze Member',
          points: 50,
          joined: 'Today'
        };
        localStorage.setItem('mr_apparel_user', JSON.stringify(userData));
        window.dispatchEvent(new Event('auth_state_change'));
        setSuccess('Account logged in! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 800);
      }
    }, 1200);
  };

  const handleQuickLogin = (role) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      let userData = {};
      
      if (role === 'customer') {
        userData = {
          name: 'John Doe',
          email: 'john@calidi.com',
          role: 'customer',
          tier: 'Gold VIP Member',
          points: 750,
          joined: 'Oct 2025'
        };
        setSuccess('Success! Logged in as Customer John Doe.');
      } else {
        userData = {
          name: 'Ruwan Silva',
          email: 'admin@calidi.com',
          role: 'admin',
          tier: 'Super Admin',
          points: 9999,
          joined: 'Jan 2024'
        };
        setSuccess('Success! Logged in as Store Admin.');
      }
      
      localStorage.setItem('mr_apparel_user', JSON.stringify(userData));
      window.dispatchEvent(new Event('auth_state_change'));
      setTimeout(() => router.push('/dashboard'), 800);
    }, 800);
  };

  return (
    <div className={styles.loginContainer}>
      {/* Decorative Orbs */}
      <div className={styles.glowOrb1}></div>
      <div className={styles.glowOrb2}></div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Logo */}
          <div className={styles.logoHeader}>
            <Link href="/" className={styles.logo}>
              MR <span style={{ color: 'var(--primary)' }}>Apparel</span>
            </Link>
            <p className={styles.tagline}>Designed to Be Different</p>
          </div>

          <h2 className={styles.welcomeText}>Access Client Portal</h2>
          <p className={styles.subText}>Track custom quotes, view recent orders, and access personalized branding tools.</p>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                className={styles.errorMessage}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                className={styles.successMessage}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <FaEnvelope className={styles.inputIcon} />
                <input
                  type="text"
                  id="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <a href="#" className={styles.forgotBtn}>Forgot Password?</a>
              </div>
              <div className={styles.inputWrapper}>
                <FaLock className={styles.inputIcon} />
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.submitBtn} ${isLoading ? styles.btnLoading : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                <>
                  Sign In <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span>Or Quick Access for Reviewers</span>
          </div>

          {/* Quick Login Buttons */}
          <div className={styles.quickAccessRow}>
            <button
              onClick={() => handleQuickLogin('customer')}
              className={styles.quickBtn}
              style={{ borderColor: 'rgba(255, 166, 0, 0.3)' }}
              disabled={isLoading}
            >
              <div className={styles.quickBtnContent}>
                <span className={styles.quickRole} style={{ color: 'var(--primary)' }}>Customer Account</span>
                <span className={styles.quickUser}>John Doe (Gold VIP)</span>
              </div>
              <FaChevronRight style={{ color: 'var(--primary)' }} />
            </button>

            <button
              onClick={() => handleQuickLogin('admin')}
              className={styles.quickBtn}
              disabled={isLoading}
            >
              <div className={styles.quickBtnContent}>
                <span className={styles.quickRole}>Store Admin</span>
                <span className={styles.quickUser}>Ruwan Silva (Manager)</span>
              </div>
              <FaChevronRight />
            </button>
          </div>

          <p className={styles.footerNote}>
            Need a corporate client account? <Link href="/contact" style={{ color: 'var(--primary)', fontWeight: '600' }}>Contact Sales</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
