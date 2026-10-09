import { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Download, LogIn } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { issueCertificate } from '../services/api';
import { LoginModal } from './LoginModal';

interface CertificateProps {
  moduleName: string;
  courseName: string;
  score: number;
  totalQuestions: number;
  onClose: () => void;
}

export function Certificate({ moduleName, courseName, score, totalQuestions, onClose }: CertificateProps) {
  const { user, isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [certUid, setCertUid] = useState(`JSL-${Date.now().toString(36).toUpperCase()}`);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const percentage = Math.round((score / totalQuestions) * 100);
  const studentName = user?.fullName || 'Guest';

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 250, 240);
    doc.rect(0, 0, w, h, 'F');

    // Border
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(3);
    doc.rect(10, 10, w - 20, h - 20);
    doc.setLineWidth(1);
    doc.rect(14, 14, w - 28, h - 28);

    // Corner decorations
    const cornerSize = 15;
    doc.setLineWidth(2);
    [[18, 18, 1, 1], [w - 18, 18, -1, 1], [18, h - 18, 1, -1], [w - 18, h - 18, -1, -1]].forEach(([x, y, dx, dy]) => {
      doc.line(x as number, y as number, (x as number) + cornerSize * (dx as number), y as number);
      doc.line(x as number, y as number, x as number, (y as number) + cornerSize * (dy as number));
    });

    // Award icon circle
    doc.setFillColor(234, 88, 12);
    doc.circle(w / 2, 40, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('\u2605', w / 2, 44, { align: 'center' });

    // Title
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Completion', w / 2, 65, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('This is to certify that', w / 2, 78, { align: 'center' });

    // Student Name
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(234, 88, 12);
    doc.text(studentName, w / 2, 93, { align: 'center' });

    // Underline
    const nameWidth = doc.getTextWidth(studentName);
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(1);
    doc.line(w / 2 - nameWidth / 2 - 5, 96, w / 2 + nameWidth / 2 + 5, 96);

    // Module text
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('has successfully completed the module', w / 2, 108, { align: 'center' });

    // Module Name
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(moduleName, w / 2, 120, { align: 'center' });

    // Course
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`from the course: ${courseName}`, w / 2, 130, { align: 'center' });

    // Score box
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.roundedRect(w / 2 - 30, 137, 60, 18, 3, 3, 'FD');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Score Achieved', w / 2, 144, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text(`${score}/${totalQuestions} (${percentage}%)`, w / 2, 152, { align: 'center' });

    // Footer line
    doc.setDrawColor(234, 88, 12);
    doc.setLineWidth(0.5);
    doc.line(30, 165, w - 30, 165);

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Date', 35, 172);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(currentDate, 35, 178);

    // Signature
    doc.setLineWidth(0.5);
    doc.setDrawColor(100, 100, 100);
    doc.line(w / 2 - 25, 175, w / 2 + 25, 175);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('JavaSchoolLab', w / 2, 181, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('An Official Product of DHIPAN Software Technologies Private Limited', w / 2, 186, { align: 'center' });

    // Certificate ID
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Certificate ID', w - 35, 172, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('courier', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(certUid, w - 35, 178, { align: 'right' });

    doc.save(`JavaSchoolLab_Certificate_${moduleName.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadCertificate = async () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    setDownloading(true);
    try {
      const certData = await issueCertificate({ courseName, topicName: moduleName, score, totalQuestions });
      setCertUid(certData.certificateUid);
      generatePDF();
    } catch (err) {
      // Previously this fell through to generatePDF(), producing a certificate whose id
      // existed nowhere in the database and could never be verified. A certificate that
      // cannot be checked is worse than none, so fail visibly instead.
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Could not issue your certificate. Check your connection and try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-8"
        >
          <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-8 border-double border-orange-400 dark:border-orange-600 rounded-xl p-12">
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-orange-400 dark:border-orange-600 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-orange-400 dark:border-orange-600 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-orange-400 dark:border-orange-600 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-orange-400 dark:border-orange-600 rounded-br-lg" />

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-600 to-amber-500 rounded-full mb-6"
              >
                <Award className="w-14 h-14 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4"
              >
                Certificate of Completion
              </motion.h1>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                This is to certify that
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-8 border-b-4 border-orange-400 dark:border-orange-600 pb-2 inline-block px-8"
              >
                {studentName}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                has successfully completed the module
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2"
              >
                {moduleName}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                from the course <span className="font-semibold text-orange-600 dark:text-orange-400">{courseName}</span>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 inline-block mb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Score Achieved</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{score}/{totalQuestions} ({percentage}%)</div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="flex justify-between items-center mt-12 pt-6 border-t-2 border-orange-300 dark:border-orange-700">
                <div className="text-left">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Date</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{currentDate}</div>
                </div>
                <div className="text-center">
                  <div className="w-48 border-t-2 border-gray-400 dark:border-gray-600 mb-2" />
                  <div className="font-semibold text-gray-800 dark:text-gray-200">JavaSchoolLab</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Online Learning Platform</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Certificate ID</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200 font-mono text-xs">{certUid}</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadCertificate}
                disabled={downloading}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg flex items-center gap-2 font-semibold disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Generating...' : 'Download PDF'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogin(true)}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg flex items-center gap-2 font-semibold"
              >
                <LogIn className="w-5 h-5" />
                Login to Download PDF
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold"
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
