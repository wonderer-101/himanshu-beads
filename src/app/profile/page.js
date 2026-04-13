"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, LogOut, User, Mail, ShoppingBag,
  ChevronRight, Clock, CheckCircle, XCircle, Truck
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/auth/AuthContext";
import styles from "./profile.module.css";

const customerAccountUrl = "/api/auth/shopify/account";
const customerProfileUrl = "/api/auth/shopify/account/profile";
const customerAddressesUrl = "/api/auth/shopify/account/addresses";

function formatMoney(amount, currencyCode = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  let icon = <Clock size={11} />;
  let variant = "pending";
  if (s === "paid" || s === "fulfilled") { icon = <CheckCircle size={11} />; variant = "success"; }
  else if (s === "unfulfilled" || s === "in_progress") { icon = <Truck size={11} />; variant = "info"; }
  else if (s === "refunded" || s === "cancelled") { icon = <XCircle size={11} />; variant = "error"; }
  return (
    <span className={`${styles.badge} ${styles["badge--" + variant]}`}>
      {icon}
      {status?.replace(/_/g, " ") || "Pending"}
    </span>
  );
}

export default function ProfilePage() {
  const { customer, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (!loading && !customer) {
      window.location.replace("/");
    }
  }, [customer, loading]);

  useEffect(() => {
    if (!customer) return;
    fetch("/api/auth/shopify/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [customer]);

  // Still loading or redirect pending
  if (loading || !customer) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <div className={styles.loadingShell}>
            <div className={styles.spinner} />
            <p>Loading your account...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const firstName = customer.firstName || "";
  const lastName = customer.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Customer";
  const email = customer.emailAddress?.emailAddress || "";
  const phone =
    customer.phoneNumber?.phoneNumber ||
    customer.phoneNumber ||
    customer.phone ||
    "";
  const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || email[0]?.toUpperCase() || "?";

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.shell}>

          {/* Hero card */}
          <div className={styles.heroCard}>
            <div className={styles.heroLeft}>
              <div className={styles.avatar}>{initials}</div>
              <div className={styles.heroInfo}>
                <h1 className={styles.heroName}>{fullName}</h1>
                <p className={styles.heroEmail}>
                  <Mail size={13} />
                  {email}
                </p>
              </div>
            </div>
            <a href="/api/auth/shopify/logout" className={styles.logoutBtn}>
              <LogOut size={14} />
              Sign out
            </a>
          </div>

          {/* Stats row */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <ShoppingBag size={20} className={styles.statIcon} />
              <span className={styles.statValue}>{orders.length}</span>
              <span className={styles.statLabel}>Total Orders</span>
            </div>
            <div className={styles.statCard}>
              <CheckCircle size={20} className={styles.statIcon} />
              <span className={styles.statValue}>
                {orders.filter(o => (o.fulfillmentStatus || "").toLowerCase() === "fulfilled").length}
              </span>
              <span className={styles.statLabel}>Delivered</span>
            </div>
            <div className={styles.statCard}>
              <Truck size={20} className={styles.statIcon} />
              <span className={styles.statValue}>
                {orders.filter(o => {
                  const s = (o.fulfillmentStatus || "").toLowerCase();
                  return s === "unfulfilled" || s === "in_progress" || s === "partial";
                }).length}
              </span>
              <span className={styles.statLabel}>In Transit</span>
            </div>
            <div className={styles.statCard}>
              <User size={20} className={styles.statIcon} />
              <span className={styles.statValue} style={{ fontSize: "0.95rem" }}>Active</span>
              <span className={styles.statLabel}>Account</span>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={styles.tab}
              data-active={activeTab === "orders" ? "true" : "false"}
              onClick={() => setActiveTab("orders")}
            >
              <Package size={15} />
              Order History
            </button>
            <button
              className={styles.tab}
              data-active={activeTab === "details" ? "true" : "false"}
              onClick={() => setActiveTab("details")}
            >
              <User size={15} />
              Account Details
            </button>
          </div>

          {/* Orders tab */}
          {activeTab === "orders" && (
            <div className={styles.tabContent}>
              {ordersLoading ? (
                <div className={styles.emptyState}>
                  <div className={styles.spinner} />
                  <p>Fetching your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className={styles.emptyState}>
                  <ShoppingBag size={40} className={styles.emptyIcon} />
                  <h3>No orders yet</h3>
                  <p>Your order history will appear here once you make a purchase.</p>
                  <Link href="/" className={styles.shopBtn}>Browse Products</Link>
                </div>
              ) : (
                <div className={styles.ordersList}>
                  {orders.map((order) => (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div className={styles.orderMeta}>
                          <span className={styles.orderName}>{order.name}</span>
                          <span className={styles.orderDate}>
                            <Clock size={11} />
                            {formatDate(order.processedAt)}
                          </span>
                        </div>
                        <div className={styles.orderRight}>
                          <span className={styles.orderTotal}>
                            {formatMoney(order.totalPrice?.amount, order.totalPrice?.currencyCode)}
                          </span>
                          {order.statusPageUrl && (
                            <a
                              href={order.statusPageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.orderTrackBtn}
                            >
                              Track <ChevronRight size={13} />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className={styles.orderBadges}>
                        <StatusBadge status={order.financialStatus} />
                        <StatusBadge status={order.fulfillmentStatus} />
                      </div>

                      {order.lineItems.length > 0 && (
                        <div className={styles.lineItems}>
                          {order.lineItems.map((li, i) => (
                            <div key={i} className={styles.lineItem}>
                              {li.image?.url ? (
                                <img src={li.image.url} alt={li.image.altText || li.title} className={styles.lineItemImg} />
                              ) : (
                                <div className={styles.lineItemImgFallback}><Package size={14} /></div>
                              )}
                              <div className={styles.lineItemInfo}>
                                <span className={styles.lineItemTitle}>{li.title}</span>
                                <span className={styles.lineItemQty}>Qty: {li.quantity}</span>
                              </div>
                              <span className={styles.lineItemPrice}>
                                {formatMoney(li.price?.amount, li.price?.currencyCode)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Account details tab */}
          {activeTab === "details" && (
            <div className={styles.tabContent}>
              <div className={styles.detailsCard}>
                <h2 className={styles.detailsTitle}>Personal Information</h2>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailField}>
                    <label>First Name</label>
                    <span>{firstName || "--"}</span>
                  </div>
                  <div className={styles.detailField}>
                    <label>Last Name</label>
                    <span>{lastName || "--"}</span>
                  </div>
                  <div className={styles.detailField} style={{ gridColumn: "1 / -1" }}>
                    <label>Email Address</label>
                    <span>{email || "--"}</span>
                  </div>
                  <div className={styles.detailField} style={{ gridColumn: "1 / -1" }}>
                    <label>Phone Number</label>
                    <span>{phone || "-- Not added yet --"}</span>
                  </div>
                </div>
                <div className={styles.detailsActions}>
                  <a href={customerProfileUrl} target="_blank" rel="noreferrer" className={styles.detailsActionBtn}>
                    Edit Name
                  </a>
                  <a href={customerProfileUrl} target="_blank" rel="noreferrer" className={styles.detailsActionBtn}>
                    Manage Phone
                  </a>
                  <a href={customerAddressesUrl} target="_blank" rel="noreferrer" className={styles.detailsActionBtn}>
                    Manage Addresses
                  </a>
                </div>
                <p className={styles.detailsNote}>
                  Profile and address updates are managed securely in your
                  <a href={customerAccountUrl} target="_blank" rel="noreferrer">
                    {" "}Shopify account page
                  </a>.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
