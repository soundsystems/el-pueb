'use client';
import Carousel from '@/components/Carousel';
import { Press } from '@/components/Press';
import Testimonials from '@/components/Testimonials';

const carouselImages = [
  {
    src: '/images/carousel/DSC01058.jpg',
    alt: 'Pueblito Mexican Restaurant Gallery Image',
  },
  {
    src: '/images/carousel/DSC01879.jpg',
    alt: 'Pueblito Mexican Restaurant Gallery Image',
  },
];

export default function HomePage() {
  return (
    <>
      <main className="flex flex-col">
        <section id="press" className="flex w-full flex-col items-center">
          <div className="w-full space-y-6 p-6">
            <Carousel images={carouselImages} />
            <Testimonials />
          </div>
          <Press />
        </section>
      </main>
    </>
  );
}
