'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PanelWnioski() {
  const router = useRouter();
  useEffect(() => { router.replace('/wnioski'); }, [router]);
  return (
    <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>
      Przekierowywanie...
    </div>
  );
}
