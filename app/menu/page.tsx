'use client';
import Menus from '@/components/Menus';

export default function HomePage() {
  return (
    <>
      <main>
        <section
          id="menu"
          className="flex h-full flex-col items-center pb-2 lg:pb-6"
        >
          <Menus />
        </section>
      </main>
    </>
  );
}
