import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Linkedin, Link2, LogIn, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { issueCertificate } from '../services/api';
import { LoginModal } from './LoginModal';
import { CertificateSheet } from './CertificateSheet';
import type { CertificateInput } from '../lib/certificate/design';
import { certificateVerifyUrl } from '../lib/siteUrl';
import { linkedInAddUrl } from '../lib/certificate/linkedin';

interface CertificateProps {
  moduleName: string;
  courseName: string;
  score: number;
  totalQuestions: number;
  onClose: () => void;
}

/** Shown on the preview until the server issues a real, stored ID at download time. */
const PENDING_ID = 'ISSUED ON DOWNLOAD';

export function Certificate({ moduleName, courseName, score, totalQuestions, onClose }: CertificateProps) {
  const { user, isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  // Set once the server has issued (and stored) the certificate: that is when it gets its real ID, date and QR code
  const [issued, setIssued] = useState<{ uid: string; at: Date } | null>(null);
  const [openedAt] = useState(() => new Date());
  const dialogRef = useFocusTrap<HTMLDivElement>(!showLogin);

  const input: CertificateInput = {
    studentName: user?.fullName || 'Guest',
    moduleName,
    courseName,
    score,
    totalQuestions,
    issuedAt: issued?.at ?? openedAt,
    certificateUid: issued?.uid ?? PENDING_ID,
    verifyUrl: issued ? certificateVerifyUrl(issued.uid) : undefined,
  };

  useEffect(() => {
    if (showLogin) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, showLogin]);

  // The ID is issued and stored by the server first, so every certificate that leaves this screen (PDF
  // or LinkedIn) can be matched to a record. Asking again for the same pass returns the same certificate.
  const issue = async (): Promise<CertificateInput> => {
    const record = await issueCertificate({ courseName, topicName: moduleName, score, totalQuestions });
    // What is printed is what the server stored: its score, its date, its ID
    const final: CertificateInput = {
      ...input,
      score: record.score,
      totalQuestions: record.totalQuestions,
      issuedAt: new Date(record.issuedAt),
      certificateUid: record.certificateUid,
      verifyUrl: certificateVerifyUrl(record.certificateUid),
    };
    setIssued({ uid: record.certificateUid, at: final.issuedAt });
    return final;
  };

  const failed = (err: unknown) => toast.error(
    err instanceof Error && err.message ? err.message : "Could not issue your certificate. Check your connection and try again."
  );

  const downloadCertificate = async () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setDownloading(true);
    try {
      const final = await issue();
      const { downloadCertificatePdf } = await import('../lib/certificate/pdf');
      await downloadCertificatePdf(final);
    } catch (err) {
      failed(err);
    } finally {
      setDownloading(false);
    }
  };

  const addToLinkedIn = async () => {
    // Opened first, inside the click, so the browser does not treat it as a blocked pop-up
    const tab = window.open('', '_blank');
    setSharing(true);
    try {
      const final = await issue();
      const url = linkedInAddUrl({ moduleName, courseName, issuedAt: final.issuedAt, certificateUid: final.certificateUid, verifyUrl: final.verifyUrl! });
      if (tab) { tab.opener = null; tab.location.href = url; } else window.open(url, '_blank', 'noopener');
    } catch (err) {
      tab?.close();
      failed(err);
    } finally {
      setSharing(false);
    }
  };

  const copyVerifyLink = async () => {
    setSharing(true);
    try {
      const final = await issue();
      await navigator.clipboard.writeText(final.verifyUrl!);
      toast.success('Verification link copied');
    } catch (err) {
      failed(err);
    } finally {
      setSharing(false);
    }
  };

  const primary = 'px-6 sm:px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-60';

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Certificate of completion"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full p-3 sm:p-6 my-auto"
        >
          <button
            onClick={onClose}
            aria-label="Close certificate"
            className="absolute -top-3 -right-3 z-10 grid place-items-center w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-lg ring-1 ring-black/10 hover:bg-orange-50 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* The certificate itself: the same drawing the PDF is made from */}
          <div className="rounded-lg overflow-hidden shadow-[0_10px_40px_-12px_rgba(124,45,18,0.45)] ring-1 ring-black/10">
            <CertificateSheet input={input} />
          </div>

          {!isLoggedIn && (
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              This preview shows "Guest". Log in so the certificate carries your name and a verifiable ID.
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-5">
            {isLoggedIn ? (
              <>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={downloadCertificate} disabled={downloading || sharing} className={primary}>
                  <Download className="w-5 h-5" aria-hidden="true" />
                  {downloading ? 'Generating...' : 'Download PDF'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={addToLinkedIn}
                  disabled={downloading || sharing}
                  className="px-6 sm:px-8 py-3 bg-[#0A66C2] text-white rounded-lg flex items-center gap-2 font-semibold shadow-md hover:bg-[#004182] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A66C2] disabled:opacity-60"
                >
                  <Linkedin className="w-5 h-5" aria-hidden="true" />
                  Add to LinkedIn
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={copyVerifyLink}
                  disabled={downloading || sharing}
                  className="px-5 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ring-1 ring-gray-300 dark:ring-gray-600 rounded-lg flex items-center gap-2 font-semibold hover:bg-orange-50 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-60"
                >
                  <Link2 className="w-5 h-5" aria-hidden="true" />
                  Copy verify link
                </motion.button>
              </>
            ) : (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setShowLogin(true)} className={primary}>
                <LogIn className="w-5 h-5" aria-hidden="true" />
                Login to Download PDF
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="px-6 sm:px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          message="Login to download your certificate"
        />
      )}
    </>
  );
}
