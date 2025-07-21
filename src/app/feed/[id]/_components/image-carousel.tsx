"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselThumbnails,
  CarouselThumbnail,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl?: string | null;
    caption?: string | null;
    isMain?: boolean | null;
  }>;
  title: string;
  className?: string;
}

const ImageCarousel = ({ images, title, className }: ImageCarouselProps) => {
  const [desktopApi, setDesktopApi] = useState<CarouselApi>();
  const [mobileApi, setMobileApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const hasMultipleImages = images.length > 1;

  const onDesktopSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, []);

  const onMobileSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (desktopApi) {
        desktopApi.scrollTo(index);
      }
      if (mobileApi) {
        mobileApi.scrollTo(index);
      }
    },
    [desktopApi, mobileApi],
  );

  useEffect(() => {
    if (!desktopApi) return;
    onDesktopSelect(desktopApi);
    desktopApi.on("select", onDesktopSelect);
    return () => {
      desktopApi?.off("select", onDesktopSelect);
    };
  }, [desktopApi, onDesktopSelect]);

  useEffect(() => {
    if (!mobileApi) return;
    onMobileSelect(mobileApi);
    mobileApi.on("select", onMobileSelect);
    return () => {
      mobileApi?.off("select", onMobileSelect);
    };
  }, [mobileApi, onMobileSelect]);

  if (images.length === 1) {
    return (
      <div className={cn("relative", className)}>
        <div className="hidden aspect-3/2 flex-1 place-content-center md:grid">
          <Image
            src={images[0].imageUrl}
            alt={title}
            width={900}
            height={600}
            className="rounded-box w-auto object-contain"
          />
        </div>
        <Image
          src={images[0].imageUrl}
          alt={title}
          width={900}
          height={600}
          className="rounded-box mt-2 h-full w-auto object-cover md:hidden"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="hidden md:block">
        <Carousel
          setApi={setDesktopApi}
          className="group relative"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="aspect-3/2">
            {images.map((image, index) => (
              <CarouselItem key={image.id}>
                <div className="flex aspect-3/2 items-center justify-center">
                  <Image
                    priority={index === 0}
                    src={image.imageUrl}
                    alt={image.caption || `${title} - imagen ${index + 1}`}
                    width={900}
                    height={600}
                    className="rounded-box max-h-full w-auto object-contain"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {hasMultipleImages && (
            <>
              <CarouselPrevious className="text-base-300 left-4 size-9 border-0 bg-white/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <CarouselNext className="text-base-300 right-4 size-9 border-0 bg-white/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </>
          )}
        </Carousel>

        {hasMultipleImages && (
          <CarouselThumbnails>
            {images.map((image, index) => (
              <CarouselThumbnail
                key={image.id}
                isActive={index === current}
                onClick={() => goToSlide(index)}
              >
                <Image
                  src={image.thumbnailUrl || image.imageUrl}
                  alt={`Miniatura ${index + 1}`}
                  fill
                  sizes="64px"
                  className="aspect-square object-cover"
                />
              </CarouselThumbnail>
            ))}
          </CarouselThumbnails>
        )}

        {hasMultipleImages && (
          <div className="bg-base-100/50 absolute top-4 right-4 rounded px-2 py-1 text-sm text-white">
            {current + 1} / {images.length}
          </div>
        )}
      </div>

      <div className="mt-1 md:hidden">
        <Carousel
          setApi={setMobileApi}
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id}>
                <Image
                  priority={index === 0}
                  src={image.imageUrl}
                  alt={image.caption || `${title} - imagen ${index + 1}`}
                  width={900}
                  height={600}
                  className="rounded-box aspect-[4/3] h-auto w-full object-cover"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {hasMultipleImages && (
          <div className="mt-3 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "size-2 rounded-full transition-all duration-200",
                  index === current ? "bg-primary" : "bg-neutral opacity-50",
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;
