'use client';
import Testimonials from '@/components/Testimonials';
import Hero from '@/components/Hero';
// const mufferaw = localFont({
//   src: './fonts/mufferaw.ttf',
//   weight: '400',
// });

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen">
        <main className="flex flex-col space-y-6">
          <section id="hero" className="flex w-full flex-col items-center">
            <Hero />
          </section>
          <section
            id="testimonials"
            className="flex w-full flex-col items-center"
          >
            <Testimonials />
          </section>
          <section id="specials" className="flex w-full flex-col items-center">
            {/* <Specials /> */}
          </section>
        </main>
      </div>
    </>
  );
}
