'use client';

import Loading from '@/app/loading';
import {} from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Suspense } from 'react';

const carouselImages = [
  'DSC00811.jpg',
  'DSC01058.jpg',
  'DSC01261.jpg',
  'DSC01270.jpg',
  'DSC01298.jpg',
  'DSC01810.jpg',
  'DSC01814.jpg',
  'DSC01824.jpg',
  'DSC01825.jpg',
  'DSC01831.jpg',
  'DSC01838.jpg',
  'DSC01845.jpg',
  'DSC01851.jpg',
  'DSC01853.jpg',
  'DSC01854.jpg',
  'DSC01855.jpg',
  'DSC01858.jpg',
  'DSC01879.jpg',
].map((filename) => ({
  src: `/images/hero/resized/${filename}`,
  alt: 'Pueblito Mexican Restaurant Gallery Image',
}));

type HeroImage = {
  src: string;
  alt: string;
};

const HeroCarousel = ({ images }: { images: HeroImage[] }) => {
  const scrollListenerRef = useRef<() => void>(() => undefined);
  const listenForScrollRef = useRef(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentImages, setCurrentImages] = useState(images);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    watchSlides: (emblaApi) => {
      const reloadEmbla = (): void => {
        const oldEngine = emblaApi.internalEngine();
        emblaApi.reInit();
        const newEngine = emblaApi.internalEngine();

        // Copy engine state to maintain scroll position
        const engineModules = [
          'scrollBody',
          'location',
          'offsetLocation',
          'previousLocation',
          'target',
        ] as const;

        for (const engineModule of engineModules) {
          Object.assign(newEngine[engineModule], oldEngine[engineModule]);
        }

        newEngine.translate.to(oldEngine.location.get());
        const { index } = newEngine.scrollTarget.byDistance(0, false);
        newEngine.index.set(index);
        newEngine.animation.start();

        setLoadingMore(false);
        listenForScrollRef.current = true;
      };

      const reloadAfterPointerUp = (): void => {
        emblaApi.off('pointerUp', reloadAfterPointerUp);
        reloadEmbla();
      };

      const engine = emblaApi.internalEngine();
      if (engine.dragHandler.pointerDown()) {
        const boundsActive = engine.limit.reachedMax(engine.target.get());
        engine.scrollBounds.toggleActive(boundsActive);
        emblaApi.on('pointerUp', reloadAfterPointerUp);
      } else {
        reloadEmbla();
      }
    },
  });

  const onScroll = useCallback(
    (emblaApi: UseEmblaCarouselType[1]) => {
      if (!listenForScrollRef.current || !emblaApi) return;

      setLoadingMore((loadingMore) => {
        const lastSlide = emblaApi.slideNodes().length - 1;
        const lastSlideInView = emblaApi.slidesInView().includes(lastSlide);
        const loadMore = !loadingMore && lastSlideInView;

        if (loadMore) {
          listenForScrollRef.current = false;
          // In a real app, this would be an API call to load more images
          setTimeout(() => {
            setCurrentImages((current) => [...current, ...images]);
          }, 1000);
        }

        return loadingMore || lastSlideInView;
      });
    },
    [images]
  );

  useEffect(() => {
    if (!emblaApi) return;

    scrollListenerRef.current = () => onScroll(emblaApi);
    emblaApi.on('scroll', scrollListenerRef.current);

    return () => {
      emblaApi.off('scroll', scrollListenerRef.current);
    };
  }, [emblaApi, onScroll]);

  return (
    <div className="relative w-full">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {currentImages.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className="relative min-w-0 flex-[0_0_100%]"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative aspect-[16/9] w-full"
              >
                <Suspense
                  fallback={
                    <div className="flex h-full w-full items-center justify-center bg-adobe">
                      <Loading />
                    </div>
                  }
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 768px) 95vw, (max-width: 1600px) 85vw, 75vw"
                  />
                </Suspense>
              </motion.div>
            </div>
          ))}
          {loadingMore && (
            <div className="relative min-w-0 flex-[0_0_100%]">
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-adobe">
                <Loading />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Hero = () => {
  const [shuffledImages, setShuffledImages] = useState(carouselImages);
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Preload the next few images when the current slide changes
  const preloadImages = useCallback(
    (currentIdx: number) => {
      const numToPreload = 2; // Preload next 2 images
      for (let i = 1; i <= numToPreload; i++) {
        const nextIdx = (currentIdx + i) % shuffledImages.length;
        const img = new window.Image();
        img.src = shuffledImages[nextIdx].src;
      }
    },
    [shuffledImages]
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on('select', () => {
      setCurrentIndex(api.selectedScrollSnap());
      preloadImages(api.selectedScrollSnap());
    });
  }, [api, preloadImages]);

  useEffect(() => {
    const shuffleArray = (array: typeof carouselImages) => {
      const [firstImage, ...restImages] = [...array];
      const shuffledRest = [...restImages];

      for (let i = shuffledRest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledRest[i], shuffledRest[j]] = [shuffledRest[j], shuffledRest[i]];
      }

      return [firstImage, ...shuffledRest];
    };

    const shuffled = shuffleArray(carouselImages);
    setShuffledImages(shuffled);

    // Preload first few images immediately
    for (const image of shuffled.slice(0, 3)) {
      const img = new window.Image();
      img.src = image.src;
    }
  }, []);

  return (
    <motion.div className="w-full space-y-2">
      <div className="w-full bg-stone-50/60 py-4 backdrop-blur-sm">
        <div className="container mx-auto px-2">
          <h2 className="text-pretty text-center font-semibold text-sm text-stone-800 xl:text-base">
            A cherished part of the <span className="tablet:hidden">NWA</span>{' '}
            <span className="tablet:inline hidden">Northwest Arkansas</span>{' '}
            community, <br className="lg:hidden" />
            we proudly serve authentic family recipes{' '}
            <br className="tablet:hidden" /> passed down through generations.
          </h2>
        </div>
      </div>

      <div className="flex w-full justify-center px-4">
        <div className="w-full max-w-[1600px]">
          <HeroCarousel images={shuffledImages} />
        </div>
      </div>

      <div className="w-full bg-stone-50/60 py-4 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-2 md:px-8">
          <h3 className="text-pretty text-center font-light text-sm text-stone-700 md:text-base">
            Experience vibrant flavors, handcrafted beverages,
            <br className="md:hidden" /> and celebrate Mexican-American culture.
          </h3>
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;
