'use client';
import { Press } from '@/components/Press';

export default function HomePage() {
  return (
    <>
      <main className="flex flex-col">
        <section id="press" className="flex items-center justify-center px-4">
          <Press />
        </section>
      </main>
    </>
  );
}
