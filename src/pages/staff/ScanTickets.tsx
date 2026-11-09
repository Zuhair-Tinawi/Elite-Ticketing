import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '@/context/AuthContext';
import { validateAndCheckInTicket } from '@/services/ticketService';

const SCANNER_ELEMENT_ID = 'qr-scanner-region';

type ScanFeedback = {
  kind: 'success' | 'error';
  message: string;
} | null;

export default function ScanTickets() {
  const { currentUser } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [feedback, setFeedback] = useState<ScanFeedback>(null);
  const [busy, setBusy] = useState(false);


  // el camera scanner redetects the same QR code on every video frame lama tkun bel pic w bas badna nsawera once.
  // el React state busy ma zabatet
  // la2an el callback sakar the `busy` value when scanning started, so

  const busyRef = useRef(false);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  async function handleDecoded(qrValue: string) {
    if (!currentUser || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const result = await validateAndCheckInTicket(qrValue, currentUser.uid);
      if (result.ok) {
        setFeedback({ kind: 'success', message: `Checked in: ${result.ticket.attendeeName}` });
      } else {
        const messages: Record<string, string> = {
          not_found: 'Ticket not found — invalid QR code.',
          already_used: 'This ticket was already checked in.',
          cancelled: 'This ticket was cancelled or refunded.',
        };
        setFeedback({ kind: 'error', message: messages[result.reason] });
      }




      // 3melna pause lal camera briefly after a decode so the same physical QR
      // code ma do8re yaamol trigger la another scan.


      scannerRef.current?.pause(true);
      setTimeout(() => {
        scannerRef.current?.resume();
      }, 2000);
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Validation failed',
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function startScanning() {
    setFeedback(null);
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => handleDecoded(decodedText),
        undefined
      );
      setScanning(true);
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: 'Could not access the camera. Check browser permissions.',
      });
    }
  }

  async function stopScanning() {
    await scannerRef.current?.stop().catch(() => {});
    setScanning(false);
  }

  return (
    <div>
      <h1>Scan Tickets</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Point the camera at an attendee's ticket QR code to check them in.
      </p>

      <div className="card" style={{ maxWidth: 420 }}>
        <div id={SCANNER_ELEMENT_ID} style={{ width: '100%' }} />
        {!scanning ? (
          <button className="btn" onClick={startScanning}>
            Start scanning
          </button>
        ) : (
          <button className="btn secondary" onClick={stopScanning}>
            Stop scanning
          </button>
        )}
      </div>








{/* hayde added la2an ma ken yozbat el npm run build, chat said this will work */}


      {busy && <p style={{ color: 'var(--color-text-muted)' }}>Checking ticket…</p>}

      {feedback && (
        <p className={feedback.kind === 'success' ? 'status-pill valid' : 'error-text'}>
          {feedback.message}
        </p>
      )}  
    </div>
  );
}