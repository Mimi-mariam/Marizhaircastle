"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatNaira } from "@/lib/utils/format";
import { useCart } from "@/lib/catalog/CartContext";
import { DELIVERY_ZONES, DeliveryZoneId, DEFAULT_DELIVERY_ZONE } from "@/lib/orders/delivery-zones";
import styles from "./CheckoutForm.module.css";

type SummaryRow = {
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
};

type ApiResponse =
  | { error: true; message: string; orderNumber?: string }
  | { error: false; paymentLink?: string; orderNumber: string };

export function CheckoutForm({
  user,
  summary,
  onZoneChange,
}: {
  user: { name: string; email: string } | null;
  summary: { rows: SummaryRow[]; subtotal: number };
  onZoneChange?: (zone: DeliveryZoneId) => void;
}) {
  const router = useRouter();
  const { guestItems, clearGuestCart, buyNowItem, clearBuyNow } = useCart();
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneId>(DEFAULT_DELIVERY_ZONE);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentZoneFee = DELIVERY_ZONES[deliveryZone].fee;
  const grandTotal = summary.subtotal + currentZoneFee;

  function handleZoneSelect(zoneId: DeliveryZoneId) {
    setDeliveryZone(zoneId);
    if (onZoneChange) {
      onZoneChange(zoneId);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const payload = {
        fullName,
        email,
        phone,
        address,
        location,
        deliveryZone,
        items: buyNowItem ? [buyNowItem] : undefined,
        guestItems: !user && !buyNowItem ? guestItems : undefined,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string; orderNumber?: string; paymentLink?: string }
        | null;

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (buyNowItem) {
        clearBuyNow();
      } else if (!user) {
        clearGuestCart();
      }

      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
        return;
      }

      // Order created without link
      router.push(`/orders/${data?.orderNumber ?? ""}/confirmation`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {!user ? (
        <div className={styles.authBanner}>
          <span>Checking out as Guest</span>
          <Link href="/login" className={styles.authBannerLink}>
            Sign in to your account
          </Link>
        </div>
      ) : null}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Delivery details</legend>

        <div className={styles.field}>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            className={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="phone">Phone number (WhatsApp reachable)</label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            required
            minLength={7}
            maxLength={20}
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Select Delivery Location</label>
          <div className={styles.zoneGroup}>
            {(Object.keys(DELIVERY_ZONES) as DeliveryZoneId[]).map((id) => {
              const zone = DELIVERY_ZONES[id];
              const isSelected = deliveryZone === id;
              return (
                <label
                  key={id}
                  className={`${styles.zoneOption} ${
                    isSelected ? styles.zoneOptionActive : ""
                  }`}
                >
                  <div className={styles.zoneOptionLabel}>
                    <input
                      type="radio"
                      name="deliveryZone"
                      value={id}
                      checked={isSelected}
                      onChange={() => handleZoneSelect(id)}
                    />
                    <span>{zone.name}</span>
                  </div>
                  <span className={styles.zoneFee}>{formatNaira(zone.fee)}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="address">Street address & landmark</label>
          <textarea
            id="address"
            autoComplete="street-address"
            required
            minLength={5}
            maxLength={500}
            rows={3}
            className={styles.textarea}
            placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, beside Domino's Pizza"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="location">City / State notes (optional)</label>
          <input
            id="location"
            type="text"
            autoComplete="address-level2"
            maxLength={200}
            placeholder="e.g. Lagos Island"
            className={styles.input}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </fieldset>

      {error ? (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          <Link href="/cart" className={styles.errorLink}>
            Return to cart
          </Link>
        </div>
      ) : null}

      <button type="submit" className={styles.submit} disabled={loading}>
        {loading ? "Processing…" : `Pay ${formatNaira(grandTotal)}`}
      </button>
      <p className={styles.secureNote}>
        Secured by Flutterwave. 24-hour delivery promise starts immediately upon payment verification.
      </p>
    </form>
  );
}