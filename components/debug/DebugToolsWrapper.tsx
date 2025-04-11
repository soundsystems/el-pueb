'use client';

import dynamic from 'next/dynamic';

const DebugTools = dynamic(() => import('./DebugTools'), {
  ssr: false,
});

export default function DebugToolsWrapper() {
  return <DebugTools />;
} 