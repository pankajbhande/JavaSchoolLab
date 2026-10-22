import { PageShell, card } from '../components/study/PageShell';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { adsEnabled } from '../components/ads/adsense';
import { setConsent, useConsent } from '../lib/consent';

const CONTACT = (import.meta.env.VITE_CONTACT_EMAIL ?? '').trim();

const UPDATED = '21 October 2026';

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

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy';
  useDocumentMeta({
    title: privacy ? 'Privacy Policy' : 'Terms of Use',
    description: privacy ? 'What JavaSchoolLab stores about you and how you control it.' : 'The terms for using JavaSchoolLab.',
    path: privacy ? '/privacy' : '/terms',
  });
  return (
    <PageShell title={privacy ? 'Privacy Policy' : 'Terms of Use'}>
      <article className={card}>{privacy ? <Privacy /> : <Terms />}</article>
    </PageShell>
  );
}
