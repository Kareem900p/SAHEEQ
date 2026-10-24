import React, { useState } from 'react';
import type { GallerySlide } from '../data/brandConfig';

/**
 * Miniature Bundle Preview inside the 4 Bundle Cards
 * Uses the real official SHAHEEQ Starter Kit photo (slide-1.jpg / https://c.top4top.io/p_3948n7a521.jpg)
 * stacked 1x, 2x, 3x, or 4x to represent the selected pack count.
 */
export const BundleMiniPreview: React.FC<{
  packsCount: number;
  variantId?: string;
}> = ({ packsCount }) => {
  const count = Math.min(4, Math.max(1, packsCount));
  const [imgSrc, setImgSrc] = useState('/assets/products/slide-1.jpg');

  return (
    <div
      className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 select-none"
      aria-hidden="true"
    >
      {count === 1 && (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-white shadow-md border border-black/10">
          <img
            src={imgSrc}
            onError={() => setImgSrc('https://c.top4top.io/p_3948n7a521.jpg')}
            alt="عبوة واحدة"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {count === 2 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-white shadow-md border border-black/15 -rotate-6 -translate-x-1.5">
            <img
              src={imgSrc}
              onError={() => setImgSrc('https://c.top4top.io/p_3948n7a521.jpg')}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden bg-white shadow-md border border-black/15 rotate-6 translate-x-1.5 -ml-4">
            <img
              src={imgSrc}
              onError={() => setImgSrc('https://c.top4top.io/p_3948n7a521.jpg')}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {count === 3 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md overflow-hidden bg-white shadow border border-black/15 -rotate-8">
            <img
              src={imgSrc}
              onError={() => setImgSrc('https://c.top4top.io/p_3948n7a521.jpg')}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-md overflow-hidden bg-white shadow-md border border-black/20 z-10 -mx-3 -translate-y-0.5">
            <img
              src={imgSrc}
              onError={() => setImgSrc('https://c.top4top.io/p_3948n7a521.jpg')}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md overflow-hidden bg-white shadow border border-black/15 rotate-8">
            <img
              src={imgSrc}
              onError={() => setImgSrc('https://c.top4top.io/p_3948n7a521.jpg')}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {count >= 4 && (
        <div className="grid grid-cols-2 gap-1 w-12 h-12 sm:w-14 sm:h-14 p-0.5 bg-white/10 rounded-lg">
          {Array.from({ length: 4 }, (_, idx) => (
            <div
              key={idx}
              className="w-full h-full rounded overflow-hidden bg-white shadow-xs border border-black/10"
            >
              <img
                src={imgSrc}
                onError={() => setImgSrc('https://c.top4top.io/p_3948n7a521.jpg')}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Product Gallery Slide Visual
 * Displays the 4 official user-provided SHAHEEQ photographs in exact order:
 * 1. https://c.top4top.io/p_3948n7a521.jpg (/assets/products/slide-1.jpg)
 * 2. https://f.top4top.io/p_3948a2h681.jpg (/assets/products/slide-2.jpg)
 * 3. https://d.top4top.io/p_3948b2lkn1.jpg (/assets/products/slide-3.jpg)
 * 4. https://e.top4top.io/p_3948bozl01.jpg (/assets/products/slide-4.jpg)
 */
export const GallerySlideVisual: React.FC<{
  slide: GallerySlide;
  variantId?: string;
  isThumbnail?: boolean;
}> = ({ slide, isThumbnail = false }) => {
  const [currentSrc, setCurrentSrc] = useState<string>(slide.imageUrl);

  // Sync image state whenever slide changes
  React.useEffect(() => {
    setCurrentSrc(slide.imageUrl);
  }, [slide.imageUrl]);

  const isContain = slide.fitMode === 'contain';

  return (
    <div className="w-full h-full relative bg-[#F4F7EE] flex items-center justify-center overflow-hidden select-none">
      {/* Subtle blurred ambient fill behind portrait slide 3 so there are no harsh bars */}
      {isContain && !isThumbnail && (
        <img
          src={currentSrc}
          onError={() => {
            if (currentSrc !== slide.fallbackUrl) {
              setCurrentSrc(slide.fallbackUrl);
            }
          }}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-35 pointer-events-none"
          referrerPolicy="no-referrer"
        />
      )}

      <img
        src={currentSrc}
        onError={() => {
          if (currentSrc !== slide.fallbackUrl) {
            setCurrentSrc(slide.fallbackUrl);
          }
        }}
        alt={slide.titleAr}
        className={`relative z-10 w-full h-full transition-transform duration-300 ${
          isContain && !isThumbnail
            ? 'object-contain'
            : 'object-cover object-top'
        }`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
