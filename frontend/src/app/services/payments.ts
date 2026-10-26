import { API_BASE, getAuthToken } from './api';

export interface ProPlan {
  id: string;
  label: string;
  amountPaise: number;
  days: number;
}

export interface PlansResponse {
  /** False until the Razorpay keys are set on the server. */
  enabled: boolean;
  /** True when only Pro learners can get a certificate. */
  certificatesProOnly: boolean;
  plans: ProPlan[];
}

export interface ProStatus {
  pro: boolean;
  expiresAt: string | null;
}

export interface Checkout {
  keyId: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  description: string;
}

/** What Razorpay Checkout hands back after a successful payment. */
export interface RazorpayResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color: string };
  handler: (result: RazorpayResult) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', cb: (r: { error?: { description?: string } }) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function headers(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function read<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || fallback);
  }
  return res.json();
}

export async function fetchPlans(): Promise<PlansResponse> {
  return read(await fetch(`${API_BASE}/payments/plans`), 'Could not load the prices');
}

export async function fetchProStatus(): Promise<ProStatus> {
  return read(await fetch(`${API_BASE}/payments/status`, { headers: headers() }), 'Could not check your plan');
}

export async function createOrder(plan: string): Promise<Checkout> {
  return read(await fetch(`${API_BASE}/payments/order`, { method: 'POST', headers: headers(), body: JSON.stringify({ plan }) }), 'Could not start the payment');
}

export async function verifyPayment(r: RazorpayResult): Promise<ProStatus> {
  return read(
    await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
    }),
    'Could not confirm the payment',
  );
}

let checkoutScript: Promise<void> | null = null;

/** Loads Razorpay's checkout script only when someone is about to pay, never on an ordinary page view. */
export function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutScript) {
    checkoutScript = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve();
      s.onerror = () => {
        checkoutScript = null;
        reject(new Error('Could not load the payment window. Check your connection and try again.'));
      };
      document.head.appendChild(s);
    });
  }
  return checkoutScript;
}

/**
 * Opens Razorpay Checkout for an order made by the server. Resolves with Razorpay's result once the learner pays, resolves with null if they
 * close the window, and rejects with Razorpay's own message if the payment fails.
 */
export function openCheckout(order: Checkout, prefill: { name?: string; email?: string; contact?: string }): Promise<RazorpayResult | null> {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('The payment window is not available.'));
      return;
    }
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency,
      name: 'JavaSchoolLab',
      description: order.description,
      order_id: order.orderId,
      prefill,
      theme: { color: '#ea580c' },
      handler: resolve,
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.on('payment.failed', r => reject(new Error(r.error?.description || 'The payment did not go through.')));
    rzp.open();
  });
}

/** "Rs 149" for 14900 paise; whole rupees only because the plans are priced in whole rupees. */
export function rupees(paise: number): string {
  return '₹' + (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}
