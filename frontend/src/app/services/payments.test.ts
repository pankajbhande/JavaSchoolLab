import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

function fakeLocalStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return { getItem: (k: string) => (k in data ? data[k] : null), setItem: (k: string, v: string) => { data[k] = v; }, removeItem: (k: string) => { delete data[k]; } };
}

describe('payments client', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it('shows prices in whole rupees with Indian grouping', async () => {
    const { rupees } = await import('./payments');
    expect(rupees(14900)).toBe('₹149');
    expect(rupees(99900)).toBe('₹999');
    expect(rupees(1250000)).toBe('₹12,500');
  });

  it('asks the server for an order by plan id only, never by price', async () => {
    const fetchMock = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) =>
      json({ keyId: 'rzp_test_x', orderId: 'order_1', amountPaise: 14900, currency: 'INR', description: 'Pro - 1 month' }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('localStorage', fakeLocalStorage({ jsl_token: 'tok' }));
    const { createOrder } = await import('./payments');
    const order = await createOrder('monthly');
    expect(order.orderId).toBe('order_1');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/payments\/order$/);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ plan: 'monthly' });
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

  it('sends Razorpay\'s three values to the server for checking, under the names the API expects', async () => {
    const fetchMock = vi.fn((_url: RequestInfo | URL, _init?: RequestInit) => json({ pro: true, expiresAt: '2026-12-01T00:00:00Z' }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('localStorage', fakeLocalStorage({ jsl_token: 'tok' }));
    const { verifyPayment } = await import('./payments');
    const status = await verifyPayment({ razorpay_order_id: 'order_1', razorpay_payment_id: 'pay_1', razorpay_signature: 'sig' });
    expect(status.pro).toBe(true);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ orderId: 'order_1', paymentId: 'pay_1', signature: 'sig' });
  });

  it('passes the server\'s own error message through, so the learner sees why', async () => {
    vi.stubGlobal('fetch', vi.fn(() => json({ error: 'Payments are not switched on yet.' }, 503)));
    vi.stubGlobal('localStorage', fakeLocalStorage());
    const { createOrder } = await import('./payments');
    await expect(createOrder('monthly')).rejects.toThrow('Payments are not switched on yet.');
  });

  it('opens checkout for the server\'s order and resolves null when the window is closed', async () => {
    let options: { order_id: string; amount: number; modal?: { ondismiss?: () => void } } | undefined;
    class FakeRazorpay {
      constructor(o: typeof options) { options = o; }
      on() {}
      open() { options?.modal?.ondismiss?.(); }
    }
    vi.stubGlobal('window', { Razorpay: FakeRazorpay });
    const { openCheckout } = await import('./payments');
    const result = await openCheckout({ keyId: 'k', orderId: 'order_7', amountPaise: 99900, currency: 'INR', description: 'Pro - 1 year' }, {});
    expect(result).toBeNull();
    expect(options?.order_id).toBe('order_7');
    expect(options?.amount).toBe(99900);
  });
});
