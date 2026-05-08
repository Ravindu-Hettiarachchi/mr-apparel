'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="navbar-logo" style={{ marginBottom: '6px' }}>
              <Image
                src="/images/mrlogo.png"
                alt="MR Apparel logo"
                width={42}
                height={42}
                style={{ objectFit: 'contain', height: '42px', width: '42px' }}
              />
              <span>
                MR <span style={{ color: 'var(--primary)' }}>Apparel</span>
              </span>
            </Link>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px' }}>
              Designed to Be Different
            </p>
            <p className="footer-brand-desc">
              Premium custom clothing solutions for corporate teams, events, and brands.
              Specializing in DTF printing, sublimation, and custom apparel that makes a statement.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="TikTok"><FaTiktok /></a>
              <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <Link href="/" className="footer-link">Home</Link>
            <Link href="/works" className="footer-link">Our Works</Link>
            <Link href="/store" className="footer-link">Store</Link>
            <Link href="/matching" className="footer-link">Quick Quote</Link>
            <Link href="/contact" className="footer-link">Contact Us</Link>
          </div>

          <div>
            <h4 className="footer-heading">Services</h4>
            <span className="footer-link">DTF Printing</span>
            <span className="footer-link">Sublimation</span>
            <span className="footer-link">Corporate Uniforms</span>
            <span className="footer-link">Custom Designs</span>
            <span className="footer-link">Bulk Orders</span>
          </div>

          <div>
            <h4 className="footer-heading">Get In Touch</h4>
            <p className="footer-link" style={{ cursor: 'default' }}>
              Colombo, Sri Lanka
            </p>
            <a href="mailto:info@mrapparel.com" className="footer-link">
              info@mrapparel.com
            </a>
            <a href="tel:+94771234567" className="footer-link">
              +94 77 123 4567
            </a>
            <p className="footer-link" style={{ cursor: 'default', marginTop: '10px' }}>
              Mon - Sat: 9AM - 6PM
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 MR Apparel. All rights reserved.</p>
          <p style={{ fontSize: '0.85rem' }}>
            Built by{' '}
            <a
              href="https://www.pixbeelabs.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)', fontWeight: 600, transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Pixbee Labs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
