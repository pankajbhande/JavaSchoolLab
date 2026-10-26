import { PageShell, card } from '../components/study/PageShell';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { adsEnabled } from '../components/ads/adsense';
import { setConsent, useConsent } from '../lib/consent';

const CONTACT = (import.meta.env.VITE_CONTACT_EMAIL ?? '').trim();

const UPDATED = '26 October 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-1 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">{children}</div>
    </section>
  );
}

/** Advertising cookies: shown only on builds that have ads; the visitor can change the choice at any time. */
function AdChoices() {
  const consent = useConsent();
  return (
    <Section title="Advertising cookies">
      <p>
        Your current choice:{' '}
        <strong>{consent === 'granted' ? 'ads allowed' : consent === 'denied' ? 'ads not allowed (no advertising script is loaded)' : 'not chosen yet'}</strong>.
        Ads are provided by Google and its partners, who use cookies to show and measure them.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setConsent('granted')} className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-700">Allow ads</button>
        <button type="button" onClick={() => setConsent('denied')} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold dark:border-gray-600">Do not allow ads</button>
      </div>
    </Section>
  );
}

function Privacy() {
  return (
    <>
      <p className="text-sm text-gray-600 dark:text-gray-300">Last updated: {UPDATED}. This explains what JavaSchoolLab stores about you, why, and how to control it.</p>
      <Section title="What we collect">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account:</strong> your name and e-mail address, and (only if you choose to give them) gender, date of birth, organisation and a profile photo. Your password is stored only as a one-way hash; we cannot read it.</li>
          <li><strong>Learning data:</strong> topics you open, quiz attempts and scores, study days, bookmarks, notes, badges and certificates.</li>
          <li><strong>Public profile (optional, off until you switch it on):</strong> the handle, bio and sections you choose to show.</li>
          <li><strong>Usage statistics:</strong> page views, searches and shares, with a random per-visit identifier and, when you are signed in, your account id. We do not store your IP address in these statistics or in the request log. Statistics older than about 13 months are deleted automatically.</li>
          <li><strong>Sign-in e-mails:</strong> a one-time code is e-mailed to you; the code expires in 5 minutes and expired codes are deleted.</li>
          <li><strong>On your device:</strong> a sign-in token and your preferences (theme, last code you typed in the practice tools) are kept in your browser storage.</li>
        </ul>
      </Section>
      <Section title="Third parties">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Google:</strong> if you use &quot;Continue with Google&quot;, Google tells us your name and e-mail address. Google Fonts are loaded from Google.</li>
          <li><strong>Advertising:</strong> the site may show Google AdSense ads. Google and its partners may use cookies to show and measure ads; see Google&apos;s advertising policies and your Google ad settings to opt out of personalised ads.</li>
          <li><strong>Code runner:</strong> the Java &quot;Try it&quot; tool sends the code you type to JDoodle to run it. Do not type secrets into it.</li>
        </ul>
        <p>We do not sell your personal data.</p>
      </Section>
      {adsEnabled && <AdChoices />}
      <Section title="Your choices">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Download your data</strong> as a JSON file, <strong>sign out of all devices</strong> and <strong>delete your account</strong> from the Account page. Deleting removes your account and everything linked to it, including your certificates, immediately and permanently.</li>
          <li>Your public profile is private until you turn it on, and you can turn it off again at any time.</li>
          <li>You can clear your browser storage at any time; you will simply be signed out.</li>
        </ul>
      </Section>
      <Section title="Security and retention">
        <p>Connections use HTTPS. Passwords are hashed, sign-in attempts are rate limited, and a password change signs out all other devices. We keep your data while your account exists; backups are kept for a short, fixed period and then replaced.</p>
      </Section>
      <Section title="Children">
        <p>JavaSchoolLab is meant for learners aged 13 and over. If you believe a child younger than 13 has created an account, delete it from the Account page or contact us and we will remove it.</p>
      </Section>
      <Section title="Contact">
        <p>
          For any privacy question or request that you cannot do from the Account page, write to{' '}
          {CONTACT ? <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a> : "the address given on the site's contact details"}.
          Changes to this policy are published on this page with a new date.
        </p>
      </Section>
    </>
  );
}

function Terms() {
  return (
    <>
      <p className="text-sm text-gray-600 dark:text-gray-300">Last updated: {UPDATED}. By creating an account or using JavaSchoolLab you agree to these terms.</p>
      <Section title="Using the site">
        <ul className="list-disc pl-5 space-y-1">
          <li>The courses, quizzes and tools are for your personal learning. Do not copy or resell the course content in bulk.</li>
          <li>Keep your password private and give true information. You are responsible for what happens under your account.</li>
          <li>Do not attack, overload or probe the site, try to guess other people&apos;s codes or passwords, or use automated tools to scrape it.</li>
        </ul>
      </Section>
      <Section title="Certificates">
        <p>A certificate is issued for a quiz you passed on the site and can be verified publicly at its link. It shows your name, the course and your score. It is a record of practice on this site, not an accredited qualification.</p>
      </Section>
      <Section title="Pro plan and payments">
        <ul className="list-disc pl-5 space-y-1">
          <li>JavaSchoolLab Pro is an optional paid plan that gives you a set period of extra benefits (shown on the Pro page). The courses themselves remain free to read.</li>
          <li>You pay once for the period you choose. There is no automatic renewal, so there is nothing to cancel; when the period ends your account simply returns to the free plan.</li>
          <li>Payments are taken by Razorpay. Prices are in Indian rupees. We never see or store your card, UPI or bank details.</li>
          <li>Refunds are described in the <a className="underline" href="/refund-policy">Refund Policy</a>.</li>
        </ul>
      </Section>
      <Section title="Your content">
        <p>Notes and profile text you write stay yours. You allow us to store and show them to you (and to others only where you switched on a public profile). Do not post unlawful or abusive text.</p>
      </Section>
      <Section title="No warranty">
        <p>The lessons and code samples are written with care and checked, but they are provided as they are. They may contain mistakes, and the site may be unavailable at times. To the extent the law allows, we are not liable for loss caused by using the site.</p>
      </Section>
      <Section title="Ending your use">
        <p>You can delete your account at any time from the Account page. We may suspend an account that breaks these terms. We may update these terms; the date above shows the latest version.</p>
      </Section>
    </>
  );
}

function Refunds() {
  return (
    <>
      <p className="text-sm text-gray-600 dark:text-gray-300">Last updated: {UPDATED}. This covers payments for JavaSchoolLab Pro, which is a digital plan that is switched on as soon as your payment is confirmed.</p>
      <Section title="Cancelling">
        <p>Pro does not renew by itself. You pay once for the period you pick, so there is no subscription to cancel and no future charge.</p>
      </Section>
      <Section title="If something went wrong with a payment">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Money was taken but Pro is not active:</strong> wait a few minutes first; confirmed payments are applied automatically. If it is still not active after 30 minutes, write to us with the payment id from your Razorpay receipt and we will switch it on or refund you in full.</li>
          <li><strong>You were charged twice for the same plan:</strong> we will refund the extra payment in full.</li>
          <li><strong>A payment failed but your account was debited:</strong> the bank or Razorpay returns that money automatically, usually within 5 to 7 working days.</li>
        </ul>
      </Section>
      <Section title="Changing your mind">
        <p>You can ask for a full refund within 7 days of paying, for any reason. After a refund your Pro access ends. After 7 days a payment is not refundable, because the plan has already been used.</p>
      </Section>
      <Section title="How refunds are paid">
        <p>Approved refunds go back to the original payment method (card, UPI, net banking or wallet) through Razorpay and normally reach you within 5 to 7 working days, depending on your bank.</p>
      </Section>
      <Section title="Contact">
        <p>
          To ask for a refund or report a payment problem, write to{' '}
          {CONTACT ? <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a> : "the address given on the site's contact details"} from the e-mail on your account and include the payment id.
        </p>
      </Section>
    </>
  );
}

const PAGES = {
  privacy: { title: 'Privacy Policy', description: 'What JavaSchoolLab stores about you and how you control it.', path: '/privacy', body: <Privacy /> },
  terms: { title: 'Terms of Use', description: 'The terms for using JavaSchoolLab.', path: '/terms', body: <Terms /> },
  refunds: { title: 'Refund Policy', description: 'How cancellations and refunds work for JavaSchoolLab Pro.', path: '/refund-policy', body: <Refunds /> },
} as const;

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' | 'refunds' }) {
  const page = PAGES[kind];
  useDocumentMeta({ title: page.title, description: page.description, path: page.path });
  return (
    <PageShell title={page.title}>
      <article className={card}>{page.body}</article>
    </PageShell>
  );
}
