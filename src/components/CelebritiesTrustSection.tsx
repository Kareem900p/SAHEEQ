import React, { useState } from 'react';
import { Check, Quote, Star, ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { CelebrityEndorsementItem } from '../data/brandConfig';

interface CelebritiesTrustSectionProps {
  items: CelebrityEndorsementItem[];
  currentLanguage?: 'ar' | 'en';
  onShopNowClick?: () => void;
}

const CelebrityPortraitCard: React.FC<{
  item: CelebrityEndorsementItem;
  index: number;
  isEn: boolean;
}> = ({ item, index, isEn }) => {
  const [imgSrc, setImgSrc] = useState<string>(item.imageUrl);

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.55,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      data-testid={`celebrity-card-${item.id}`}
      dir={isEn ? 'ltr' : 'rtl'}
      className="group relative rounded-3xl overflow-hidden bg-[#021E26] border border-white/15 hover:border-[#CEF90B]/60 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
    >
      {/* Vertical Portrait Container (Tall 9:14 aspect ratio) */}
      <div className="relative w-full aspect-[9/14] overflow-hidden bg-[#01181E]">
        <img
          src={imgSrc}
          onError={() => {
            if (imgSrc !== item.fallbackUrl) {
              setImgSrc(item.fallbackUrl);
            }
          }}
          alt={isEn ? `${item.nameEn} - ${item.roleEn}` : `${item.nameAr} - ${item.roleAr}`}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 select-none"
          referrerPolicy="no-referrer"
        />

        {/* Top & Bottom Subtle Gradient Vignettes for Contrast */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#01181E]/75 via-[#01181E]/25 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#01181E] via-[#01181E]/65 to-transparent"
        />

        {/* Top Floating Identity Bar: @username + Verified Check */}
        <div className="absolute top-3.5 inset-x-3.5 z-10 flex items-center justify-between gap-2">
          <div
            dir="ltr"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#01181E]/85 backdrop-blur-md border border-white/15 text-[#F4F3EF] text-xs font-extrabold shadow-lg"
          >
            <span
              style={{ backgroundColor: item.shapeBgHex }}
              className="w-4 h-4 rounded-full text-[#01181E] inline-flex items-center justify-center shrink-0"
            >
              <Check className="w-2.5 h-2.5 stroke-[3.5]" />
            </span>
            <span className="tracking-tight">{item.username}</span>
          </div>

          <span
            style={{
              backgroundColor: item.shapeBgHex,
              color: '#01181E',
            }}
            className="px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-md"
          >
            {isEn ? item.roleEn : item.roleAr}
          </span>
        </div>

        {/* Bottom Overlaid Colored Shape ("شيب لوني") with Quote + Name + Role + Username */}
        <div className="absolute bottom-3.5 inset-x-3.5 z-10 pt-2">
          {/* Upward Speech Pointer Tail */}
          <div
            aria-hidden="true"
            style={{ backgroundColor: item.shapeBgHex }}
            className={`absolute top-0.5 ${
              isEn ? 'left-7' : 'right-7'
            } w-4 h-4 rotate-45 rounded-xs shadow-sm`}
          />

          {/* Sculpted Colored Shape Box */}
          <div
            style={{
              backgroundColor: item.shapeBgHex,
              borderColor: item.shapeBorderHex,
            }}
            className="relative z-10 rounded-2xl rounded-ee-3xl p-4 text-[#01181E] border-2 shadow-[0_14px_32px_rgba(0,0,0,0.45)] overflow-hidden text-start"
          >
            {/* Subtle Watermark Quote Icon inside the Colored Shape */}
            <Quote
              aria-hidden="true"
              className={`w-12 h-12 text-[#01181E]/10 absolute -bottom-1.5 ${
                isEn ? '-right-1.5' : '-left-1.5'
              } pointer-events-none`}
            />

            {/* Header Row inside Shape: Celebrity Name + Role Tag */}
            <div className="flex items-center justify-between gap-2 mb-1.5 relative z-10">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="type-body font-extrabold text-[#01181E] truncate">
                  {isEn ? item.nameEn : item.nameAr}
                </h3>
                <span
                  style={{
                    backgroundColor: item.tagBgHex,
                    color: item.tagTextHex,
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0"
                >
                  {isEn ? item.roleEn : item.roleAr}
                </span>
              </div>

              {/* 5 Stars */}
              <div className="flex items-center gap-0.5 shrink-0" aria-hidden="true">
                {Array.from({ length: 5 }, (_, sIdx) => (
                  <Star
                    key={sIdx}
                    className="w-3 h-3 text-[#01181E] fill-[#01181E]"
                  />
                ))}
              </div>
            </div>

            {/* Prominent Quote inside the Colored Shape */}
            <p className="type-body font-extrabold text-[#01181E] leading-snug relative z-10">
              «{isEn ? item.quoteEn : item.quoteAr}»
            </p>

            {/* Footer Row inside Shape: @username & Verified SHAHEEQ User */}
            <div className="mt-2.5 pt-2 border-t border-[#01181E]/15 flex items-center justify-between gap-2 text-[11px] font-extrabold text-[#01181E]/85 relative z-10">
              <span dir="ltr" className="font-mono tracking-tight">
                {item.username}
              </span>
              <span>{isEn ? 'SHAHEEQ V2' : 'تجربة حقيقية • شهيق'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export const CelebritiesTrustSection: React.FC<CelebritiesTrustSectionProps> = ({
  items,
  currentLanguage = 'ar',
  onShopNowClick,
}) => {
  const isEn = currentLanguage === 'en';

  return (
    <section
      id="celebrities-section"
      data-testid="celebrities-trust-section"
      aria-label={isEn ? 'Celebrities Trust Us' : 'المشاهير يثقون بنا'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="w-full bg-[#01181E] py-12 sm:py-16 border-t border-white/10 overflow-hidden"
    >
      <div className="layout-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 text-[#CEF90B] type-xs font-extrabold mb-2">
            <span>{isEn ? 'REAL CREATORS & EXPERTS' : 'ثقة صنّاع المحتوى والأطباء'}</span>
            <span aria-hidden="true">•</span>
            <span>{isEn ? '100% Real Experience' : 'تجربة فعلية 100%'}</span>
          </div>

          <h2 className="type-h2 font-extrabold text-[#F4F3EF]">
            {isEn ? 'Celebrities Trust Us' : 'المشاهير يثقون بنا'}
          </h2>

          <p className="type-sm text-[#C2CFD4] mt-2">
            {isEn
              ? 'Top content creators and pharmacists using SHAHEEQ during work, gym workouts, and daily breathing.'
              : 'صنّاع محتوى وصيادلة جرّبوا موسّع الأنف المغناطيسي من شهيق في الشغل، الجيم، والتنفس اليومي.'}
          </p>
        </motion.div>

        {/* 3 Vertical Portrait Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item, idx) => (
            <CelebrityPortraitCard
              key={item.id}
              item={item}
              index={idx}
              isEn={isEn}
            />
          ))}
        </div>

        {/* Bottom Conversion CTA */}
        {onShopNowClick && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-8 sm:mt-10 flex justify-center"
          >
            <button
              type="button"
              onClick={onShopNowClick}
              data-testid="celebrities-cta-btn"
              className="min-h-[48px] px-7 rounded-full bg-[#DDFE01] hover:bg-[#CEF90B] text-[#01181E] type-sm font-extrabold inline-flex items-center gap-2 shadow-[0_6px_22px_rgba(221,254,1,0.22)] transition-all cursor-pointer"
            >
              <span>
                {isEn ? 'Order SHAHEEQ Like Them Now' : 'اطلب شهيق وعيش نفس التجربة الآن'}
              </span>
              {isEn ? (
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ArrowUpLeft className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
