import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { PageShell, card } from '../components/study/PageShell';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useAuth } from '../context/AuthContext';
import { usePro } from '../context/ProContext';
import { PlansResponse, ProPlan, createOrder, fetchPlans, loadCheckout, openCheckout, rupees, verifyPayment } from '../services/payments';

const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export default function PricingPage() {
  useDocumentMeta({
    title: 'JavaSchoolLab Pro',
    description: 'Learn without ads and support new lessons. Monthly and yearly plans, paid securely with UPI, cards or net banking.',
    path: '/pricing',
  });
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { isPro, expiresAt, refresh } = usePro();
  const [plans, setPlans] = useState<PlansResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans().then(setPlans).catch(() => setFailed(true));
  }, []);

  async function buy(plan: ProPlan) {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setBusy(plan.id);
    try {
      const order = await createOrder(plan.id);
      await loadCheckout();
      const result = await openCheckout(order, { name: user?.fullName, email: user?.email ?? undefined, contact: user?.mobile ?? undefined });
      if (!result) return;                                  // closed the window without paying
      try {
        await verifyPayment(result);
        await refresh();
        toast.success('Payment received. You are now a Pro learner!');
      } catch (e) {
        // The webhook still applies a real payment, so this is "wait a moment", not "you lost your money".
        toast.error(e instanceof Error ? e.message : 'We could not confirm the payment yet. If money was taken, Pro will switch on within a few minutes.');
        void refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The payment did not go through.');
    } finally {
      setBusy(null);
    }
  }

  const monthly = plans?.plans.find(p => p.id === 'monthly');
  const saving = (p: ProPlan) => (monthly && p.days >= 365 ? Math.max(0, Math.round(100 - (p.amountPaise / (monthly.amountPaise * 12)) * 100)) : 0);
  const features = [
    'No ads while you learn',
    ...(plans?.certificatesProOnly ? ['Verified certificates you can share on LinkedIn'] : []),
    'Helps us keep adding and checking lessons',
  ];

  return (
    <PageShell title="JavaSchoolLab Pro" subtitle="Learn without ads and support new lessons">
      <div className="space-y-4">
        <section className={card}>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
            Every course on JavaSchoolLab stays free to read. Pro is for learners who want a calmer page and want to help the lessons keep growing.
          </p>
          {isPro && expiresAt && (
            <p className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-200">
              <Crown className="h-4 w-4" aria-hidden="true" /> You are Pro until {dateFormat.format(new Date(expiresAt))}. Paying again adds to the time you have left.
            </p>
          )}
        </section>

        {failed && <section className={card}><p className="text-sm text-red-600">The prices could not be loaded. Please refresh the page.</p></section>}
        {plans && !plans.enabled && (
          <section className={card}><p className="text-sm text-gray-700 dark:text-gray-200">Pro purchases open soon. Please check back shortly.</p></section>
        )}

        {plans && (
          <div className="grid gap-4 sm:grid-cols-2">
            {plans.plans.map(p => (
              <section key={p.id} className={`${card} flex flex-col`}>
                <h2 className="text-lg font-bold">{p.label}</h2>
                <p className="mt-2 text-3xl font-extrabold text-orange-600">{rupees(p.amountPaise)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  for {p.days} days, one payment, no automatic renewal
                  {saving(p) > 0 && <strong className="ml-1 text-green-700 dark:text-green-300">(save {saving(p)}%)</strong>}
                </p>
                <ul className="mt-3 flex-1 space-y-1.5 text-sm text-gray-700 dark:text-gray-200">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />{f}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={!plans.enabled || busy !== null}
                  onClick={() => void buy(p)}
                  className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === p.id ? 'Opening payment...' : isLoggedIn ? (isPro ? 'Add this plan' : 'Upgrade to Pro') : 'Sign in to upgrade'}
                </button>
              </section>
            ))}
          </div>
        )}

        <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
          Payments are processed by Razorpay (UPI, cards, net banking, wallets); we never see your card details. Read the{' '}
          <Link to="/terms" className="underline">Terms of Use</Link>, the <Link to="/refund-policy" className="underline">Refund Policy</Link> and the{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </PageShell>
  );
}
