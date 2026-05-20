'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaTshirt, FaTag, FaClock, FaCheckCircle, FaChevronRight,
  FaSignOutAlt, FaInfoCircle, FaFileInvoice, FaTruck, FaUndoAlt,
  FaTimes, FaUpload, FaWhatsapp, FaUserShield, FaUsers, FaBoxOpen,
  FaCheck, FaPowerOff, FaExchangeAlt
} from 'react-icons/fa';
import styles from './dashboard.module.css';

/* ============================
   PRESET MOCK DATA
   ============================ */
const INITIAL_ORDERS = [
  {
    id: 'MR-9842',
    name: 'Classic Crew Neck Tees',
    qty: '50 pcs',
    date: 'May 12, 2026',
    price: 61500,
    status: 'processing',
    refundStatus: null,
    items: '50 x Classic Crew Neck Tees (Black, Size M)',
    customer: 'John Doe',
    email: 'john@calidi.com'
  },
  {
    id: 'MR-9511',
    name: 'Premium Polo Shirts',
    qty: '25 pcs',
    date: 'May 08, 2026',
    price: 50600,
    status: 'delivered',
    refundStatus: null, // Eligible for refund
    items: '25 x Premium Polo Shirts (Navy, Size L)',
    customer: 'John Doe',
    email: 'john@calidi.com'
  },
  {
    id: 'MR-9240',
    name: 'Urban Hoodies',
    qty: '10 pcs',
    date: 'April 24, 2026',
    price: 32000,
    status: 'delivered',
    refundStatus: 'Refunded', // Already refunded
    refundReason: 'Fabric Defect',
    refundAmount: 32000,
    items: '10 x Urban Hoodies (Charcoal, Size XL)',
    customer: 'John Doe',
    email: 'john@calidi.com'
  }
];

const INITIAL_QUOTES = [
  {
    id: 'QT-2051',
    garment: 'Sublimation Tees',
    qty: 100,
    price: 165000,
    status: 'Approved',
    date: 'May 15, 2026',
    timeline: '8 – 12 business days'
  },
  {
    id: 'QT-1940',
    garment: 'Corporate Crew Tees',
    qty: 250,
    price: 312000,
    status: 'Reviewing',
    date: 'May 18, 2026',
    timeline: '12 – 18 business days'
  }
];

const MOCKUP_DESIGNS = [
  {
    id: 1,
    name: 'TechCorp Staff Tees',
    garment: 'Classic Crew Neck',
    color: 'Burgundy',
    method: 'DTF Printing',
    date: '3 days ago'
  },
  {
    id: 2,
    name: 'Innovate Polo Uniform',
    garment: 'Premium Polo Shirt',
    color: 'Navy',
    method: 'Embroidery',
    date: '1 week ago'
  }
];

const INITIAL_USERS = [
  { id: 1, name: 'John Doe', email: 'john@calidi.com', role: 'customer', status: 'Active', joined: 'Oct 2025' },
  { id: 2, name: 'Sarah Chen', email: 'sarah.chen@techcorp.com', role: 'customer', status: 'Active', joined: 'Nov 2025' },
  { id: 3, name: 'James Wilson', email: 'james@innovatelk.com', role: 'customer', status: 'Deactivated', joined: 'Dec 2025' },
  { id: 4, name: 'Priya Fernando', email: 'priya@creativehub.lk', role: 'customer', status: 'Active', joined: 'Feb 2026' },
  { id: 5, name: 'Ruwan Silva', email: 'admin@calidi.com', role: 'admin', status: 'Active', joined: 'Jan 2024' }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // customer: orders, quotes, mockups | admin: orders, customers, quotes
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [users, setUsers] = useState([]);
  
  // Refund Modal State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState(null);
  const [refundReason, setRefundReason] = useState('wrong-size');
  const [customNote, setCustomNote] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Success Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Authenticate and load states
    const stored = localStorage.getItem('mr_apparel_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(stored);

    // Initialize orders and user lists from storage or mock data
    const storedOrders = localStorage.getItem('mr_apparel_orders');
    const initialOrders = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;
    if (!storedOrders) {
      localStorage.setItem('mr_apparel_orders', JSON.stringify(INITIAL_ORDERS));
    }

    const storedUsers = localStorage.getItem('mr_apparel_users');
    const initialUsers = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
    if (!storedUsers) {
      localStorage.setItem('mr_apparel_users', JSON.stringify(INITIAL_USERS));
    }

    setTimeout(() => {
      setUser(parsedUser);
      setOrders(initialOrders);
      setUsers(initialUsers);
    }, 0);
  }, [router]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('mr_apparel_user');
    setUser(null);
    window.dispatchEvent(new Event('auth_state_change'));
    router.push('/');
  };

  /* ============================
     REFUND FLOW LOGIC
     ============================ */
  const openRefundModal = (order) => {
    setSelectedRefundOrder(order);
    setRefundReason('wrong-size');
    setCustomNote('');
    setUploadedImages([]);
    setRefundModalOpen(true);
  };

  const handleImageSimulation = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const names = Array.from(files).map(file => file.name);
      setUploadedImages(prev => [...prev, ...names]);
      showToast(`${names.length} image(s) attached successfully!`);
    }
  };

  const submitRefundRequest = (e) => {
    e.preventDefault();
    if (!selectedRefundOrder) return;

    setIsSubmittingRefund(true);
    
    setTimeout(() => {
      // Find and update the order state
      const updatedOrders = orders.map(ord => {
        if (ord.id === selectedRefundOrder.id) {
          const reasonLabel = {
            'wrong-size': "Size doesn't fit correctly",
            'wrong-color': "Wrong color/garment shipped",
            'defective': "Fabric quality issue or damage",
            'print-defect': "Print misalignment or cracking",
            'other': "Other reason"
          }[refundReason] || "Refund requested";

          return {
            ...ord,
            refundStatus: 'Pending Review',
            refundReason: reasonLabel,
            refundNote: customNote,
            refundAttachedImages: uploadedImages
          };
        }
        return ord;
      });

      setOrders(updatedOrders);
      localStorage.setItem('mr_apparel_orders', JSON.stringify(updatedOrders));
      setIsSubmittingRefund(false);
      setRefundModalOpen(false);
      showToast('Refund request submitted successfully! Our team will review it.');
    }, 1500);
  };

  /* ============================
     ADMIN ACTIONS LOGIC
     ============================ */
  const updateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });
    setOrders(updated);
    localStorage.setItem('mr_apparel_orders', JSON.stringify(updated));
    showToast(`Order ${orderId} status updated to ${newStatus}`);
  };

  // Past request 4 & 5: toggle account status (activate/deactivate)
  const toggleUserStatus = (userId) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Deactivated' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem('mr_apparel_users', JSON.stringify(updated));
    const userObj = updated.find(u => u.id === userId);
    showToast(`${userObj.name}'s account is now ${userObj.status}`);
  };

  // Past request 4 & 5: update user role (admin and customer only)
  const changeUserRole = (userId, newRole) => {
    if (newRole !== 'admin' && newRole !== 'customer') return;

    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    setUsers(updated);
    localStorage.setItem('mr_apparel_users', JSON.stringify(updated));
    const userObj = updated.find(u => u.id === userId);
    showToast(`${userObj.name}'s role changed to ${newRole}`);
  };

  // Rendering Helper
  function fmtLKR(n) {
    return 'LKR ' + Number(n).toLocaleString('en-LK');
  }

  if (!user) {
    return (
      <div className={styles.loadingWrapper}>
        <div className="loading-logo">MR</div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  const isCustomer = user.role === 'customer';

  return (
    <div className={styles.dashboardPage}>
      {/* Glow shapes */}
      <div className={styles.glowBg1}></div>
      <div className={styles.glowBg2}></div>

      {/* Success Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <FaCheckCircle style={{ color: '#2ecc71', fontSize: '1.2rem' }} />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        
        {/* ======= HEADER ======= */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerWelcome}>
            <div className={styles.avatarLarge}>
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <span className={styles.headerLabel}>
                {isCustomer ? 'Client Workspace' : 'Store Administration'}
              </span>
              <h1 className={styles.headerName}>
                Welcome Back, <span className="text-gradient">{user.name}</span>
              </h1>
              <p className={styles.headerJoined}>Account joined {user.joined}</p>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '12px 24px' }}>
            <FaSignOutAlt /> Log Out
          </button>
        </div>

        {/* ======= MAIN LAYOUT ======= */}
        <div className={styles.dashboardGrid}>
          
          {/* ---- LEFT: MAIN CONTENT TABS ---- */}
          <div className={styles.mainContent}>
            
            {/* Tab navigation */}
            <div className={styles.tabsContainer}>
              {isCustomer ? (
                <>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabBtnActive : ''}`}
                  >
                    <FaBoxOpen /> Recent Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('quotes')}
                    className={`${styles.tabBtn} ${activeTab === 'quotes' ? styles.tabBtnActive : ''}`}
                  >
                    <FaTag /> Price Quotes
                  </button>
                  <button
                    onClick={() => setActiveTab('mockups')}
                    className={`${styles.tabBtn} ${activeTab === 'mockups' ? styles.tabBtnActive : ''}`}
                  >
                    <FaTshirt /> Saved Designs
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabBtnActive : ''}`}
                  >
                    <FaBoxOpen /> Manage Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`${styles.tabBtn} ${activeTab === 'customers' ? styles.tabBtnActive : ''}`}
                  >
                    <FaUsers /> Customer Accounts
                  </button>
                  <button
                    onClick={() => setActiveTab('quotes')}
                    className={`${styles.tabBtn} ${activeTab === 'quotes' ? styles.tabBtnActive : ''}`}
                  >
                    <FaTag /> Bulk Price Estimates
                  </button>
                </>
              )}
            </div>

            {/* Tab Panes */}
            <div className={styles.tabContentPane}>
              <AnimatePresence mode="wait">
                
                {/* 1. ORDERS TAB */}
                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.paneHeader}>
                      <h3 className={styles.paneTitle}>
                        {isCustomer ? 'Your Orders & Tracking' : 'All Shop Orders'}
                      </h3>
                      <p className={styles.paneDesc}>
                        {isCustomer 
                          ? 'Review processing progress, track deliveries, and request warranty adjustments' 
                          : 'Update order processing statuses, verify payments, and process refund claims'}
                      </p>
                    </div>

                    <div className={styles.ordersList}>
                      {orders
                        .filter(o => isCustomer ? o.email === user.email : true)
                        .map(order => (
                          <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderCardHeader}>
                              <div>
                                <span className={styles.orderId}>Order ID: {order.id}</span>
                                <span className={styles.orderDate}>{order.date}</span>
                              </div>
                              <div className={styles.statusRow}>
                                {/* Status Badge */}
                                <span className={`${styles.statusBadge} ${styles['status_' + order.status]}`}>
                                  {order.status}
                                </span>
                                {/* Refund Badge */}
                                {order.refundStatus && (
                                  <span className={styles.refundBadge}>
                                    Refund: {order.refundStatus}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={styles.orderCardBody}>
                              <div className={styles.orderItemsInfo}>
                                <FaTshirt className={styles.bodyIcon} />
                                <div>
                                  <p className={styles.orderItemsText}>{order.items}</p>
                                  <span className={styles.orderQuantity}>Qty: {order.qty}</span>
                                  {!isCustomer && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '2px' }}>
                                      Client: {order.customer} ({order.email})
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className={styles.orderPricing}>
                                <span className={styles.priceLabel}>Estimated Total</span>
                                <span className={styles.priceValue}>{fmtLKR(order.price)}</span>
                              </div>
                            </div>

                            {/* Tracking visual timeline */}
                            <div className={styles.timelineWrapper}>
                              <div className={styles.timelineTrack}>
                                <div 
                                  className={styles.timelineBar} 
                                  style={{
                                    width: order.status === 'processing' ? '33%' : 
                                           order.status === 'shipped' ? '66%' : 
                                           order.status === 'delivered' ? '100%' : '0%'
                                  }}
                                />
                              </div>
                              <div className={styles.timelinePoints}>
                                <div className={`${styles.point} ${styles.pointActive}`} title="Order Paid">
                                  <div className={styles.pointDot} />
                                  <span className={styles.pointLabel}>Paid</span>
                                </div>
                                <div className={`${styles.point} ${order.status !== 'pending' ? styles.pointActive : ''}`} title="Order processing">
                                  <div className={styles.pointDot} />
                                  <span className={styles.pointLabel}>Processing</span>
                                </div>
                                <div className={`${styles.point} ${(order.status === 'shipped' || order.status === 'delivered') ? styles.pointActive : ''}`} title="Order shipped">
                                  <div className={styles.pointDot} />
                                  <span className={styles.pointLabel}>Shipped</span>
                                </div>
                                <div className={`${styles.point} ${order.status === 'delivered' ? styles.pointActive : ''}`} title="Order delivered">
                                  <div className={styles.pointDot} />
                                  <span className={styles.pointLabel}>Delivered</span>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className={styles.orderCardFooter}>
                              {isCustomer ? (
                                <>
                                  <div className={styles.footerInfoBar}>
                                    <FaClock />
                                    <span>7 days warranty active</span>
                                  </div>
                                  <div className={styles.footerActions}>
                                    <button className={styles.btnSecondary} onClick={() => showToast('Order invoice downloaded.')}>
                                      <FaFileInvoice /> Invoice
                                    </button>
                                    
                                    {order.status === 'delivered' && !order.refundStatus && (
                                      <button onClick={() => openRefundModal(order)} className={styles.btnRefund}>
                                        <FaUndoAlt /> Request Refund
                                      </button>
                                    )}

                                    {order.refundStatus && (
                                      <button 
                                        className={styles.btnInfo} 
                                        onClick={() => showToast(`Refund Claim: ${order.refundReason || 'Under Review'}`)}
                                      >
                                        <FaInfoCircle /> Refund Info
                                      </button>
                                    )}

                                    {order.status !== 'delivered' && (
                                      <button className={styles.btnTrack} onClick={() => showToast('Connecting to courier GPS API...')}>
                                        <FaTruck /> Track Package
                                      </button>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className={styles.adminUpdateBar}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Admin Controls:</span>
                                    <div className={styles.adminActionSelectWrapper}>
                                      <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className={styles.adminSelect}
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                      </select>
                                    </div>
                                  </div>

                                  {order.refundStatus === 'Pending Review' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button
                                        onClick={() => {
                                          const updated = orders.map(ord => {
                                            if (ord.id === order.id) {
                                              return { ...ord, refundStatus: 'Approved', status: 'cancelled' };
                                            }
                                            return ord;
                                          });
                                          setOrders(updated);
                                          localStorage.setItem('mr_apparel_orders', JSON.stringify(updated));
                                          showToast(`Approved refund for order ${order.id}`);
                                        }}
                                        className={styles.btnApproveRefund}
                                      >
                                        Approve Refund
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}

                {/* 2. CUSTOMER ACCOUNTS TAB (ADMIN ONLY) */}
                {activeTab === 'customers' && !isCustomer && (
                  <motion.div
                    key="customers"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.paneHeader}>
                      <h3 className={styles.paneTitle}>Manage Customer Accounts</h3>
                      <p className={styles.paneDesc}>
                        View registered users, customize permissions/roles (restricted to Admin & Customer), and activate or deactivate customer profiles.
                      </p>
                    </div>

                    <div className={styles.customersTableWrapper}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>User Details</th>
                            <th>Email Address</th>
                            <th>User Role</th>
                            <th>Session Status</th>
                            <th style={{ textAlign: 'right' }}>Management Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div className={styles.tableAvatar}>
                                    {u.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p style={{ fontWeight: '600' }}>{u.name}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-200)' }}>Joined {u.joined}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontSize: '0.9rem', color: 'var(--white-muted)' }}>{u.email}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    color: u.role === 'admin' ? 'var(--primary)' : 'var(--white-muted)',
                                    background: u.role === 'admin' ? 'rgba(255, 166, 0, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                  }}>
                                    {u.role}
                                  </span>

                                  {/* Change Role Selector - Request 5: Admin & Customer ONLY */}
                                  <select
                                    value={u.role}
                                    onChange={(e) => changeUserRole(u.id, e.target.value)}
                                    className={styles.roleSelect}
                                    title="Modify role"
                                  >
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </div>
                              </td>
                              <td>
                                <span className={`${styles.activationBadge} ${u.status === 'Active' ? styles.activeGreen : styles.deactiveRed}`}>
                                  {u.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {/* Account activate/deactivate toggle - Request 4 */}
                                <button
                                  onClick={() => toggleUserStatus(u.id)}
                                  className={`${styles.btnPower} ${u.status === 'Active' ? styles.btnPowerActive : styles.btnPowerDeactive}`}
                                  title={u.status === 'Active' ? "Deactivate Account" : "Activate Account"}
                                >
                                  <FaPowerOff /> {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* 3. PRICE QUOTES TAB */}
                {activeTab === 'quotes' && (
                  <motion.div
                    key="quotes"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.paneHeader}>
                      <h3 className={styles.paneTitle}>Custom Price Calculators</h3>
                      <p className={styles.paneDesc}>
                        Quotes and calculations generated using the Quick Quote tool. Reach our WhatsApp desk to proceed to mockup samples.
                      </p>
                    </div>

                    <div className={styles.quotesGrid}>
                      {quotes.map(quote => (
                        <div key={quote.id} className={styles.quoteCard}>
                          <div className={styles.quoteHeader}>
                            <span className={styles.quoteId}>Estimate {quote.id}</span>
                            <span className={`${styles.quoteStatus} ${styles['status_' + quote.status]}`}>
                              {quote.status}
                            </span>
                          </div>
                          
                          <div className={styles.quoteBody}>
                            <h4>{quote.garment}</h4>
                            <p className={styles.quoteMeta}>Quantity requested: <strong>{quote.qty} pieces</strong></p>
                            <p className={styles.quoteMeta}>Estimated production: <span>{quote.timeline}</span></p>
                            
                            <div className={styles.quotePricingRow}>
                              <span className={styles.quotePricingLabel}>Live Estimate</span>
                              <span className={styles.quotePricingVal}>{fmtLKR(quote.price)}</span>
                            </div>
                          </div>

                          <div className={styles.quoteFooter}>
                            <span className={styles.quoteDate}>Created {quote.date}</span>
                            <a
                              href={`https://wa.me/94704909218?text=Hi MR Apparel! I want to confirm custom quote ${quote.id} for ${quote.qty} ${quote.garment}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.btnWhatsapp}
                            >
                              <FaWhatsapp /> Finalize Quote
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 4. SAVED MOCKUPS TAB (CUSTOMER ONLY) */}
                {activeTab === 'mockups' && isCustomer && (
                  <motion.div
                    key="mockups"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={styles.paneHeader}>
                      <h3 className={styles.paneTitle}>Your Saved Branding Designs</h3>
                      <p className={styles.paneDesc}>
                        Instant custom designs created using our color alignment matching tools.
                      </p>
                    </div>

                    <div className={styles.mockupGrid}>
                      {MOCKUP_DESIGNS.map(mockup => (
                        <div key={mockup.id} className={styles.mockupCard}>
                          <div className={styles.mockupGraphic}>
                            <FaTshirt className={styles.mockupIcon} style={{ color: mockup.color === 'Burgundy' ? '#800020' : '#000080' }} />
                            <span className={styles.mockupColorDot} style={{ background: mockup.color === 'Burgundy' ? '#800020' : '#000080' }} />
                          </div>

                          <div className={styles.mockupBody}>
                            <h4>{mockup.name}</h4>
                            <p className={styles.mockupDetail}>Garment: <span>{mockup.garment}</span></p>
                            <p className={styles.mockupDetail}>Color way: <span>{mockup.color}</span></p>
                            <p className={styles.mockupDetail}>Print type: <span>{mockup.method}</span></p>
                          </div>

                          <div className={styles.mockupFooter}>
                            <span className={styles.mockupDate}>Saved {mockup.date}</span>
                            <Link href={`/matching?garment=${mockup.garment.toLowerCase().includes('polo') ? 'polo' : 'crew'}`} className={styles.btnEditMock}>
                              Load Mockup
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

          {/* ---- RIGHT: SIDEBAR INFO ---- */}
          <div className={styles.sidebar}>
            
            {/* Loyalty points card (Customer only) */}
            {isCustomer ? (
              <div className={styles.loyaltyCard}>
                <div className={styles.loyaltyGlow}></div>
                <span className={styles.loyaltyBadge}>{user.tier}</span>
                <h3 className={styles.loyaltyTitle}>Branding Rewards</h3>
                
                <div className={styles.pointsCircleWrapper}>
                  <div className={styles.pointsNumber}>
                    <span>{user.points}</span>
                    <label>Points</label>
                  </div>
                </div>
                
                <p className={styles.loyaltySub}>
                  You are only <strong>250 points</strong> away from unlocking your next corporate discount voucher (LKR 5,000)!
                </p>

                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressLabel}>
                    <span>Silver Voucher Goal</span>
                    <span>75%</span>
                  </div>
                  <div className={styles.progressContainer}>
                    <div className={styles.progressInner} style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.adminStatsCard}>
                <span className={styles.loyaltyBadge}>SYSTEM STATS</span>
                <h3 className={styles.loyaltyTitle}>Apparel Management</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--gray-200)', fontSize: '0.9rem' }}>Active Orders:</span>
                    <strong style={{ color: 'var(--primary)' }}>{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--gray-200)', fontSize: '0.9rem' }}>Pending Refunds:</span>
                    <strong style={{ color: '#ff4d4d' }}>{orders.filter(o => o.refundStatus === 'Pending Review').length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--gray-200)', fontSize: '0.9rem' }}>Deactivated Accounts:</span>
                    <strong>{users.filter(u => u.status === 'Deactivated').length}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Quick action shortcuts */}
            <div className={styles.shortcutCard}>
              <h4 className={styles.shortcutTitle}>Quick Navigation</h4>
              <div className={styles.shortcutLinks}>
                <Link href="/store" className={styles.shortcutLink}>
                  <span>Shop Premium Apparel Store</span>
                  <FaChevronRight />
                </Link>
                <Link href="/matching" className={styles.shortcutLink}>
                  <span>Color Alignment Matcher</span>
                  <FaChevronRight />
                </Link>
                <Link href="/works" className={styles.shortcutLink}>
                  <span>Explore Recent Works</span>
                  <FaChevronRight />
                </Link>
              </div>
            </div>

            {/* Live Chat Support Desk (Customer only) */}
            {isCustomer && (
              <div className={styles.supportCard}>
                <div className={styles.supportAvatar}>
                  R
                  <span className={styles.avatarIndicator}></span>
                </div>
                <div>
                  <h4 className={styles.supportName}>Ruwan, Success Desk</h4>
                  <p className={styles.supportLabel}>Your Dedicated Accounts Manager</p>
                  <a
                    href="https://wa.me/94704909218?text=Hi Ruwan! I am John Doe, logged in as customer. I have a question about MR Apparel custom orders."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px 16px', fontSize: '0.8rem', marginTop: '16px', borderRadius: 'var(--radius-sm)' }}
                  >
                    <FaWhatsapp /> Contact Representative
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ======= DYNAMIC REFUND REQUEST MODAL ======= */}
      <AnimatePresence>
        {refundModalOpen && selectedRefundOrder && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRefundModalOpen(false)}
          >
            <motion.div
              className={styles.modalCard}
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={styles.modalHeader}>
                <div>
                  <span className={styles.modalSub}>Order: {selectedRefundOrder.id}</span>
                  <h3 className={styles.modalTitle}>Request Warranty Refund</h3>
                </div>
                <button className={styles.modalClose} onClick={() => setRefundModalOpen(false)}>
                  <FaTimes />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={submitRefundRequest} className={styles.modalForm}>
                <div className={styles.modalWarningBox}>
                  <FaInfoCircle style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <p>
                    Refunds are subject to review. We offer automatic approvals if there was a printing mismatch or structural fabric damage.
                  </p>
                </div>

                {/* Dropdown Reason Selector */}
                <div className={styles.modalInputGroup}>
                  <label className={styles.modalLabel}>Why do you need a refund?</label>
                  <div className={styles.selectWrapper}>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className={styles.modalSelect}
                    >
                      <option value="wrong-size">Size doesn&apos;t fit correctly</option>
                      <option value="wrong-color">Wrong color/garment shipped</option>
                      <option value="defective">Fabric quality issue or damage</option>
                      <option value="print-defect">Print misalignment or cracking</option>
                      <option value="other">Other reason (Provide details below)</option>
                    </select>
                  </div>
                </div>

                {/* Custom Note */}
                <div className={styles.modalInputGroup}>
                  <label className={styles.modalLabel}>Explain your issue in detail</label>
                  <textarea
                    rows={4}
                    placeholder="Provide specific notes regarding the garment size discrepancy, printing color, or fabric defects to expedite approval."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className={styles.modalTextarea}
                    required
                  />
                </div>

                {/* Custom Image Upload Simulator */}
                <div className={styles.modalInputGroup}>
                  <label className={styles.modalLabel}>Attach Reference Images (MANDATORY)</label>
                  <div className={styles.uploadZone}>
                    <input
                      type="file"
                      id="refund-images"
                      multiple
                      accept="image/*"
                      onChange={handleImageSimulation}
                      className={styles.hiddenFileInput}
                    />
                    <label htmlFor="refund-images" className={styles.uploadZoneLabel}>
                      <FaUpload className={styles.uploadZoneIcon} />
                      <span>Drag & drop images here or <strong>browse files</strong></span>
                      <p>Attach up to 3 high-res images showing the print misalignment or defect.</p>
                    </label>
                  </div>

                  {/* Thumbnail List */}
                  {uploadedImages.length > 0 && (
                    <div className={styles.thumbnailList}>
                      {uploadedImages.map((name, i) => (
                        <div key={i} className={styles.thumbnail}>
                          <div className={styles.thumbnailImgPlaceholder}>
                            <FaTshirt />
                          </div>
                          <span className={styles.thumbnailName}>{name}</span>
                          <button
                            type="button"
                            className={styles.thumbnailRemove}
                            onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className={styles.modalFooter}>
                  <button type="button" onClick={() => setRefundModalOpen(false)} className={styles.btnGhost}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${styles.btnSubmitRefund} ${isSubmittingRefund ? styles.btnLoading : ''}`}
                    disabled={isSubmittingRefund}
                  >
                    {isSubmittingRefund ? (
                      <div className={styles.spinner} style={{ borderTopColor: 'var(--black)' }}></div>
                    ) : (
                      <>Submit Request</>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
