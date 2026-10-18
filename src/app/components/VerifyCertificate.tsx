import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, ShieldAlert, Search, Loader2, ArrowLeft } from 'lucide-react';
import { verifyCertificate, type VerifiedCertificate } from '../services/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { CertificateSheet } from './CertificateSheet';
import { certificateVerifyUrl } from '../lib/siteUrl';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'valid'; cert: VerifiedCertificate }
  | { kind: 'invalid' }
  | { kind: 'error'; message: string };

const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** Public page a certificate's QR code opens: confirms the certificate is real and shows what it says. */
export default function VerifyCertificate() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: uid ? 'loading' : 'idle' });
  const [typed, setTyped] = useState(uid ?? '');

  useDocumentMeta({
    title: 'Verify a certificate',
    description: 'Check that a JavaSchoolLab certificate of completion is genuine.',
    path: uid ? `/verify/${uid}` : '/verify',
  });

  // An individual certificate is the holder's to share; keep it out of search results.
  useEffect(() => {
    const tag = document.createElement('meta');
    tag.name = 'robots';
    tag.content = 'noindex, nofollow';
    document.head.appendChild(tag);
    return () => { tag.remove(); };
  }, []);

  useEffect(() => {
    setTyped(uid ?? '');
    if (!uid) { setState({ kind: 'idle' }); return; }
    let cancelled = false;
    setState({ kind: 'loading' });
    verifyCertificate(uid.trim())
      .then(cert => { if (!cancelled) setState(cert ? { kind: 'valid', cert } : { kind: 'invalid' }); })
      .catch(err => { if (!cancelled) setState({ kind: 'error', message: err instanceof Error ? err.message : 'Could not verify right now.' }); });
    return () => { cancelled = true; };
  }, [uid]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = typed.trim().toUpperCase();
    if (id) navigate(`/verify/${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <header className="bg-gradient-to-r from-orange-600 to-amber-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> JavaSchoolLab
          </Link>
          <span className="text-sm font-semibold opacity-95">Certificate verification</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <form onSubmit={submit} className="max-w-xl mx-auto mb-8">
          <label htmlFor="cert-id" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Certificate ID</label>
          <div className="flex gap-2">
            <input
              id="cert-id"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="JSL-XXXX-XXXX-XXXX"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-orange-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button type="submit" className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold flex items-center gap-2 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
              <Search className="w-4 h-4" aria-hidden="true" /> Verify
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Printed under the QR code at the bottom of the certificate.</p>
        </form>

        <div role="status" aria-live="polite">
          {state.kind === 'idle' && (
            <p className="text-center text-gray-600 dark:text-gray-300">Scan the QR code on a certificate, or type its ID above, to check that it is genuine.</p>
          )}

          {state.kind === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-10 text-gray-600 dark:text-gray-300">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" aria-hidden="true" />
              <span>Checking certificate…</span>
            </div>
          )}

          {state.kind === 'invalid' && (
            <div className="max-w-xl mx-auto rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-6 text-center">
              <ShieldAlert className="w-12 h-12 mx-auto text-red-600 dark:text-red-400" aria-hidden="true" />
              <h1 className="mt-3 text-xl font-bold text-red-800 dark:text-red-200">Certificate not found</h1>
              <p className="mt-2 text-sm text-red-900/80 dark:text-red-100/80">
                No certificate with this ID was issued by JavaSchoolLab. Check the ID for typing mistakes (the letters O and I are never used),
                or scan the QR code again. If the ID is right, treat the certificate as not genuine.
              </p>
            </div>
          )}

          {state.kind === 'error' && (
            <div className="max-w-xl mx-auto rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-6 text-center">
              <h1 className="text-lg font-bold text-amber-900 dark:text-amber-200">We could not check this right now</h1>
              <p className="mt-2 text-sm text-amber-900/80 dark:text-amber-100/80">{state.message}</p>
            </div>
          )}

          {state.kind === 'valid' && (
            <div className="space-y-8">
              <div className="max-w-2xl mx-auto rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 p-6 text-center">
                <BadgeCheck className="w-14 h-14 mx-auto text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <h1 className="mt-3 text-2xl font-bold text-emerald-800 dark:text-emerald-200">Verified: this certificate is genuine</h1>
                <p className="mt-1 text-sm text-emerald-900/80 dark:text-emerald-100/80">Issued by JavaSchoolLab, an official product of DHIPAN Software Technologies Private Limited.</p>
              </div>

              <dl className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 rounded-2xl bg-white dark:bg-gray-800 border border-orange-100 dark:border-gray-700 p-6 shadow-sm">
                {[
                  ['Awarded to', state.cert.studentName],
                  ['Module completed', state.cert.topicName],
                  ['Course', state.cert.courseName],
                  ['Score', `${state.cert.score}/${state.cert.totalQuestions} (${state.cert.percentage}%)`],
                  ['Date of issue', when(state.cert.issuedAt)],
                  ['Certificate ID', state.cert.certificateUid],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{k}</dt>
                    <dd className={`mt-0.5 font-semibold break-words ${k === 'Certificate ID' ? 'font-mono text-sm' : ''}`}>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="max-w-4xl mx-auto rounded-lg overflow-hidden shadow-[0_10px_40px_-12px_rgba(124,45,18,0.45)] ring-1 ring-black/10">
                <CertificateSheet
                  input={{
                    studentName: state.cert.studentName,
                    moduleName: state.cert.topicName,
                    courseName: state.cert.courseName,
                    score: state.cert.score,
                    totalQuestions: state.cert.totalQuestions,
                    issuedAt: new Date(state.cert.issuedAt),
                    certificateUid: state.cert.certificateUid,
                    verifyUrl: certificateVerifyUrl(state.cert.certificateUid),
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
