'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ScrollAnimations';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaPaperPlane,
  FaCheckCircle,
} from 'react-icons/fa';
import styles from './contact.module.css';

const contactInfo = [
  {
    icon: <FaMapMarkerAlt />,
    title: 'Visit Us',
    details: ['123 Fashion Avenue', 'Colombo 03, Sri Lanka'],
  },
  {
    icon: <FaPhone />,
    title: 'Call Us',
    details: ['+94 70 490 9218'],
  },
  {
    icon: <FaEnvelope />,
    title: 'Email Us',
    details: ['info@mrapparel.com', 'orders@mrapparel.com'],
  },
  {
    icon: <FaClock />,
    title: 'Working Hours',
    details: ['Mon - Fri: 9AM - 6PM', 'Sat: 9AM - 2PM'],
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    quantity: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send to an API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      {/* Hero */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg}>
          <Image
            src="/images/corporate-banner.png"
            alt="Contact us"
            fill
            style={{ objectFit: 'cover' }}
          />
          <div className={styles.pageHeroOverlay}></div>
        </div>
        <div className={styles.pageHeroContent}>
          <motion.span
            className="heading-sm text-gradient"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Get In Touch
          </motion.span>
          <motion.h1
            className="heading-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Contact <span className="text-gradient">Us</span>
          </motion.h1>
          <motion.p
            className="text-muted"
            style={{ fontSize: '1.15rem', maxWidth: '500px', marginTop: '16px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Let&apos;s discuss your next custom apparel project
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className={`section ${styles.infoSection}`}>
        <div className="container">
          <StaggerContainer className={styles.infoGrid}>
            {contactInfo.map((info, i) => (
              <StaggerItem key={i}>
                <div className={`card-glass ${styles.infoCard}`}>
                  <div className={styles.infoIcon}>{info.icon}</div>
                  <h3 className={styles.infoTitle}>{info.title}</h3>
                  {info.details.map((d, j) => (
                    <p key={j} className={styles.infoDetail}>
                      {d}
                    </p>
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className={`section ${styles.formSection}`}>
        <div className="container">
          <div className={styles.formGrid}>
            {/* Form */}
            <ScrollReveal direction="left">
              <div className={styles.formWrapper}>
                <h2 className="heading-md" style={{ marginBottom: '8px' }}>
                  Send Us a <span className="text-gradient">Message</span>
                </h2>
                <p className="text-muted" style={{ marginBottom: '32px', fontSize: '0.95rem' }}>
                  Fill out the form below and we&apos;ll get back to you within 24 hours
                </p>

                {submitted ? (
                  <motion.div
                    className={styles.successMessage}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <FaCheckCircle className={styles.successIcon} />
                    <h3>Message Sent!</h3>
                    <p>Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Full Name</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={styles.formInput}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+94 70 490 9218"
                          value={formData.phone}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Service</label>
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          className={styles.formInput}
                          required
                        >
                          <option value="">Select a service</option>
                          <option value="dtf">DTF Printing</option>
                          <option value="sublimation">Sublimation</option>
                          <option value="corporate">Corporate Uniforms</option>
                          <option value="custom">Custom Design</option>
                          <option value="bulk">Bulk Orders</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Estimated Quantity</label>
                      <input
                        type="text"
                        name="quantity"
                        placeholder="e.g. 50 - 100 pieces"
                        value={formData.quantity}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Message</label>
                      <textarea
                        name="message"
                        placeholder="Tell us about your project, design requirements, timeline..."
                        value={formData.message}
                        onChange={handleChange}
                        className={styles.formTextarea}
                        rows={5}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
                      <FaPaperPlane /> Send Message
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>

            {/* Side Panel */}
            <ScrollReveal direction="right">
              <div className={styles.sidePanel}>
                <div className={styles.sidePanelCard}>
                  <h3 className={styles.sidePanelTitle}>Quick Connect</h3>
                  <p className={styles.sidePanelDesc}>
                    Need a faster response? Reach out to us directly via WhatsApp
                    for instant quotes and support.
                  </p>
                  <a
                    href="https://wa.me/94704909218"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappBtn}
                  >
                    <FaWhatsapp /> Chat on WhatsApp
                  </a>
                </div>

                <div className={styles.sidePanelCard}>
                  <h3 className={styles.sidePanelTitle}>Follow Us</h3>
                  <p className={styles.sidePanelDesc}>
                    Stay updated with our latest works, offers, and behind-the-scenes content.
                  </p>
                  <div className={styles.socialLinks}>
                    <a href="#" className={styles.socialLink}>
                      <FaInstagram /> Instagram
                    </a>
                    <a href="#" className={styles.socialLink}>
                      <FaFacebookF /> Facebook
                    </a>
                    <a href="#" className={styles.socialLink}>
                      <FaTiktok /> TikTok
                    </a>
                  </div>
                </div>

                <div className={styles.sidePanelCard}>
                  <h3 className={styles.sidePanelTitle}>Bulk Order?</h3>
                  <p className={styles.sidePanelDesc}>
                    For orders above 100 pieces, we offer special pricing,
                    dedicated project management, and priority production.
                  </p>
                  <div className={styles.bulkFeatures}>
                    <span>✓ Volume discounts</span>
                    <span>✓ Free design support</span>
                    <span>✓ Sample production</span>
                    <span>✓ Priority delivery</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.mapSection}>
        <ScrollReveal>
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63371.81535128529!2d79.82118735!3d6.9270786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
              width="100%"
              height="450"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="MR Apparel Location"
            ></iframe>
            <div className={styles.mapOverlayBand}>
              <div className="container">
                <div className={styles.mapOverlayContent}>
                  <div>
                    <h3>MR Apparel HQ</h3>
                    <p>123 Fashion Avenue, Colombo 03, Sri Lanka</p>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
