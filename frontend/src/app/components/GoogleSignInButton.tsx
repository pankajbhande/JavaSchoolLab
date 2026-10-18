import { useEffect, useRef, useState } from 'react';
import { getAuthConfig, loginWithGoogle } from '../services/api';
import type { AuthResponse } from '../services/api';

const SCRIPT = 'https://accounts.google.com/gsi/client';

let scriptPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { scriptPromise = null; reject(new Error('Could not load Google sign-in')); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

interface Props {
  onSuccess: (res: AuthResponse) => void;
  onError: (message: string) => void;
}

/** "Continue with Google". Renders nothing until the server says a Google client id is configured. */
export function GoogleSignInButton({ onSuccess, onError }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState('');
  const callbacks = useRef({ onSuccess, onError });
  callbacks.current = { onSuccess, onError };

  useEffect(() => {
    let cancelled = false;
    getAuthConfig().then(c => { if (!cancelled) setClientId(c.googleClientId || ''); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!clientId || !box.current) return;
    let cancelled = false;
    loadGoogleScript().then(() => {
      const gsi = (window as any).google?.accounts?.id;
      if (cancelled || !gsi || !box.current) return;
      gsi.initialize({
        client_id: clientId,
        callback: async (resp: { credential?: string }) => {
          try {
            if (!resp.credential) throw new Error('Google did not return a sign-in token');
            callbacks.current.onSuccess(await loginWithGoogle(resp.credential));
          } catch (e: any) {
            callbacks.current.onError(e.message || 'Google sign-in failed');
          }
        },
      });
      box.current.innerHTML = '';
      gsi.renderButton(box.current, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: 320 });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [clientId]);

  if (!clientId) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-3" aria-hidden="true">
        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-500 dark:text-gray-400">or</span>
        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>
      <div ref={box} className="flex justify-center min-h-[44px]" />
    </div>
  );
}
