'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaColumns } from 'react-icons/fa';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/works', label: 'Our Works' },
  { href: '/store', label: 'Store' },
  { href: '/matching', label: 'Quick Quote' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Listen for login/logout and load user safely after hydration
  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem('mr_apparel_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Custom event to sync user across files
    window.addEventListener('auth_state_change', checkUser);
    window.addEventListener('storage', checkUser);
    return () => {
      window.removeEventListener('auth_state_change', checkUser);
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setMenuOpen(false);
      setDropdownOpen(false);
    }, 0);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('mr_apparel_user');
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('auth_state_change'));
    router.push('/');
  };

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <Image
              src="/images/mrlogo.png"
              alt="MR Apparel logo"
              width={44}
              height={44}
              style={{ objectFit: 'contain', height: '44px', width: '44px' }}
              priority
            />
            <span>
              MR <span style={{ color: 'var(--primary)' }}>Apparel</span>
            </span>
          </Link>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard"
                className={`navbar-link ${pathname === '/dashboard' ? 'active' : ''}`}
                style={{ color: 'var(--primary)' }}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="navbar-avatar-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '50px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-backdrop)',
                    color: 'var(--white)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={() => setDropdownOpen(true)}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      color: 'var(--black)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.9rem'
                    }}
                  >
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500', display: 'none', md: 'block' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      onMouseLeave={() => setDropdownOpen(false)}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        width: '200px',
                        background: 'rgba(10, 10, 10, 0.95)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        backdropFilter: 'blur(20px)',
                        padding: '8px',
                        zIndex: 1010,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
                        <p style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--white)' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-200)' }}>{user.email}</p>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.65rem',
                          background: 'rgba(255, 166, 0, 0.15)',
                          color: 'var(--primary)',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          marginTop: '4px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {user.role}
                        </span>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="navbar-dropdown-link"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: 'var(--white-muted)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FaColumns style={{ fontSize: '0.8rem' }} /> Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="navbar-dropdown-link"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: '#ff4d4d',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FaSignOutAlt style={{ fontSize: '0.8rem' }} /> Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="navbar-cta" style={{ fontFamily: 'var(--font-secondary)' }}>
                Portal
              </Link>
            )}

            <div
              className={`mobile-menu-btn ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <Link href={link.href}>{link.label}</Link>
              </motion.div>
            ))}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Link href="/dashboard" style={{ color: 'var(--primary)' }}>Dashboard</Link>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '280px', marginTop: '10px' }}
            >
              {user ? (
                <button
                  onClick={handleLogout}
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '12px 24px', fontSize: '0.85rem' }}
                >
                  <FaSignOutAlt /> Log Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px 24px', fontSize: '0.85rem' }}
                >
                  Login Portal
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
