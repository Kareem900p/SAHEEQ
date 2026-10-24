import React, { useState } from 'react';
import { Check, Star, Pause, Play, Quote, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReviewItem } from '../data/brandConfig';

interface CustomerReviewsProps {
  reviews: ReviewItem[];
  currentLanguage?: 'ar' | 'en';
}

interface ShapeTheme {
  bgHex: string;
  borderHex: string;
  tagBg: string;
  tagText: string;
  accentDot: string;
  avatarBg: string;
}

const REVIEW_SHAPE_THEMES: ShapeTheme[] = [
  {
    bgHex: '#DDFE01',
    borderHex: '#CEF90B',
    tagBg: '#01181E',
    tagText: '#DDFE01',
    accentDot: '#01181E',
    avatarBg: '#163828',
  },
  {
    bgHex: '#6EE7B7',
    borderHex: '#34D399',
    tagBg: '#01181E',
    tagText: '#6EE7B7',
    accentDot: '#01181E',
    avatarBg: '#0F352E',
  },
  {
    bgHex: '#7DD3FC',
    borderHex: '#38BDF8',
    tagBg: '#01181E',
    tagText: '#7DD3FC',
    accentDot: '#01181E',
    avatarBg: '#0C2D3E',
  },
  {
    bgHex: '#FDE047',
    borderHex: '#FACC15',
    tagBg: '#01181E',
    tagText: '#FDE047',
    accentDot: '#01181E',
    avatarBg: '#332B0E',
  },
  {
    bgHex: '#86EFAC',
    borderHex: '#4ADE80',
    tagBg: '#01181E',
    tagText: '#86EFAC',
    accentDot: '#01181E',
    avatarBg: '#113322',
  },
  {
    bgHex: '#99F6E4',
    borderHex: '#2DD4BF',
    tagBg: '#01181E',
    tagText: '#99F6E4',
    accentDot: '#01181E',
    avatarBg: '#0D3330',
  },
];

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({
  reviews,
  currentLanguage = 'ar',
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'sleep' | 'breathing' | 'sport' | 'setup'
  >('all');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const isEn = currentLanguage === 'en';

  const filteredReviews =
    activeCategory === 'all'
      ? reviews
      : reviews.filter((r) => r.categoryGroup === activeCategory);

  // Duplicate filtered reviews to create a seamless 0% -> -50% slow continuous marquee
  const marqueeItems = [...filteredReviews, ...filteredReviews];

  // Maintain a calm, consistent reading velocity (~5.8s per card) regardless of filter count
  const dynamicDurationSeconds = Math.max(36, Math.round(filteredReviews.length * 5.8));

  const categoryTabs: Array<{
    id: 'all' | 'sleep' | 'breathing' | 'sport' | 'setup';
    labelAr: string;
    labelEn: string;
    count: number;
  }> = [
    {
      id: 'all',
      labelAr: `الكل (${reviews.length})`,
      labelEn: `All (${reviews.length})`,
      count: reviews.length,
    },
    {
      id: 'sleep',
      labelAr: 'النوم والشخير',
      labelEn: 'Sleep & Snoring',
      count: reviews.filter((r) => r.categoryGroup === 'sleep').length,
    },
    {
      id: 'sport',
      labelAr: 'الجيم والجري',
      labelEn: 'Gym & Running',
      count: reviews.filter((r) => r.categoryGroup === 'sport').length,
    },
    {
      id: 'setup',
      labelAr: 'التركيب والمقاس',
      labelEn: 'Fit & Setup',
      count: reviews.filter((r) => r.categoryGroup === 'setup').length,
    },
    {
      id: 'breathing',
      labelAr: 'سهولة التنفس',
      labelEn: 'Easy Breathing',
      count: reviews.filter((r) => r.categoryGroup === 'breathing').length,
    },
  ];

  return (
    <section
      id="reviews-section"
      aria-label={isEn ? 'Customer Reviews' : 'آراء العملاء'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="w-full bg-[#01181E] py-12 sm:py-16 border-t border-white/10 overflow-hidden"
    >
      <div className="layout-container">
        {/* Section Header with Scroll-Triggered Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#133320] text-[#DDFE01] type-xs font-extrabold border border-[#DDFE01]/25 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? `${reviews.length} VERIFIED CUSTOMER REVIEWS`
                  : `${reviews.length} تجربة حقيقية موثقة`}
              </span>
            </span>
            <h2 className="type-h2 font-extrabold text-[#F4F3EF]">
              {isEn ? 'Customer Reviews' : 'آراء العملاء'}
            </h2>
            <p className="type-body text-[#C2CFD4] mt-1">
              {isEn
                ? 'Ordered by real impact: from quieter sleep and less snoring to peak gym performance.'
                : 'مرتبة حسب تجارب العملاء الفعلية في النوم، تقليل الشخير، الجيم، وسهولة التركيب.'}
            </p>
          </div>

          {/* Rating Summary + Motion Play/Pause Control */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#03232B] border border-white/12 type-sm shadow-md">
              <div className="flex items-center gap-1 text-[#DDFE01]">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-extrabold text-[#F4F3EF] tabular-nums">4.9 / 5</span>
              <span className="text-[#C2CFD4] type-xs font-bold tabular-nums">
                ({reviews.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={
                isPaused
                  ? isEn
                    ? 'Resume moving reviews'
                    : 'تشغيل حركة الآراء'
                  : isEn
                  ? 'Pause moving reviews'
                  : 'إيقاف حركة الآراء مؤقتاً'
              }
              className="min-h-[44px] min-w-[44px] px-3.5 rounded-xl bg-[#03232B] hover:bg-[#05303B] border border-[#CEF90B]/30 text-[#CEF90B] type-xs font-extrabold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isEn ? 'Play' : 'تحريك'}</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>{isEn ? 'Pause' : 'إيقاف مؤقت'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Interactive Category Filter Bar (All >= 44px touch target) */}
        <div
          role="tablist"
          aria-label={isEn ? 'Filter reviews by topic' : 'تصفية التقييمات حسب الموضوع'}
          className="flex flex-wrap items-center gap-2 mb-6"
        >
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setActiveCardId(null);
                }}
                className={`min-h-[44px] px-4 rounded-xl type-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#DDFE01] text-[#01181E] shadow-sm'
                    : 'bg-[#03232B] text-[#C2CFD4] border border-white/10 hover:border-[#CEF90B]/40 hover:text-[#F4F3EF]'
                }`}
              >
                {isEn ? tab.labelEn : tab.labelAr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slow Continuous Animated Cards Stream (Full-Bleed with Edge Fade Masks) */}
      <div className="relative w-full py-2">
        {/* Soft Gradient Fade Masks on Left & Right Edges */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-20 bg-gradient-to-r from-[#01181E] to-transparent z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-20 bg-gradient-to-l from-[#01181E] to-transparent z-10"
        />

        {/* Force LTR wrapper for marquee transform math while keeping internal card dir localized */}
        <div dir="ltr" className="w-full overflow-hidden">
          <div
            data-testid="reviews-marquee-track"
            style={{ animationDuration: `${dynamicDurationSeconds}s` }}
            className={`reviews-marquee-track gap-5 px-4 ${
              isPaused ? 'reviews-marquee-paused' : ''
            }`}
          >
            {marqueeItems.map((rev, idx) => {
              const originalIndex = idx % filteredReviews.length;
              const shapeTheme =
                REVIEW_SHAPE_THEMES[originalIndex % REVIEW_SHAPE_THEMES.length];
              const isHighlighted = activeCardId === rev.id;

              return (
                <article
                  key={`${rev.id}-${idx}`}
                  dir={isEn ? 'ltr' : 'rtl'}
                  onClick={() =>
                    setActiveCardId((prev) => (prev === rev.id ? null : rev.id))
                  }
                  className={`w-[300px] sm:w-[340px] shrink-0 rounded-2xl bg-[#03232B]/95 border p-4 flex flex-col justify-between transition-all duration-300 select-none cursor-pointer ${
                    isHighlighted
                      ? 'border-[#DDFE01] -translate-y-1.5 shadow-[0_14px_30px_rgba(221,254,1,0.14)]'
                      : 'border-white/12 hover:-translate-y-1 hover:border-[#CEF90B]/45 shadow-lg'
                  }`}
                >
                  {/* TOP PART: Compact Person Portrait Avatar + Verified Customer Header */}
                  <div className="flex items-center justify-between gap-3 px-1 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Compact Person Portrait Avatar (56x56px, NOT oversized square) */}
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-[#CEF90B]/60 shadow-md bg-[#01181E]">
                        <CustomerPortraitAvatar
                          reviewId={rev.id}
                          gender={rev.gender || 'male'}
                          authorName={isEn ? rev.authorNameEn : rev.authorNameAr}
                          accentColor={shapeTheme.bgHex}
                        />
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0.5 end-0.5 w-4 h-4 rounded-full bg-[#DDFE01] text-[#01181E] flex items-center justify-center shadow"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0 text-start">
                        <div className="flex items-center gap-1.5">
                          <span className="type-sm font-extrabold text-[#F4F3EF] truncate">
                            {isEn ? rev.authorNameEn : rev.authorNameAr}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#CEF90B]/15 text-[#CEF90B] text-[10px] font-bold">
                            {isEn ? 'Verified' : 'موثق'}
                          </span>
                        </div>

                        <span className="type-xs text-[#C2CFD4] font-medium truncate mt-0.5">
                          {isEn ? rev.roleOrContextEn : rev.roleOrContextAr}
                        </span>

                        {/* 5-Star Rating */}
                        <div
                          className="flex items-center gap-0.5 mt-1"
                          aria-label={
                            isEn
                              ? `${rev.rating} out of 5 stars`
                              : `التقييم ${rev.rating} من 5`
                          }
                        >
                          {Array.from({ length: 5 }, (_, starIdx) => (
                            <Star
                              key={starIdx}
                              className="w-3.5 h-3.5 text-[#DDFE01] fill-[#DDFE01]"
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sequential Order Badge (#1 to #26) */}
                    <span className="type-xs font-extrabold text-[#CEF90B]/70 tabular-nums shrink-0">
                      #{originalIndex + 1}
                    </span>
                  </div>

                  {/* BOTTOM PART: Distinctive Colored Shape Bubble Holding the Comment */}
                  <div className="relative mt-2 pt-2">
                    {/* Upward Colored Speech Pointer Tail pointing to the Customer Photo */}
                    <div
                      aria-hidden="true"
                      style={{ backgroundColor: shapeTheme.bgHex }}
                      className={`absolute top-0.5 ${
                        isEn ? 'left-6' : 'right-6'
                      } w-4 h-4 rotate-45 rounded-xs`}
                    />

                    {/* Sculpted Colored Shape Container */}
                    <div
                      style={{
                        backgroundColor: shapeTheme.bgHex,
                        borderColor: shapeTheme.borderHex,
                      }}
                      className="relative z-10 rounded-2xl rounded-ee-3xl p-4 text-[#01181E] border shadow-inner flex flex-col justify-between min-h-[142px] overflow-hidden text-start"
                    >
                      {/* Subtle Geometric Watermark Shape inside Colored Bubble */}
                      <Quote
                        aria-hidden="true"
                        className={`w-12 h-12 text-[#01181E]/8 absolute -bottom-1 ${
                          isEn ? '-right-1' : '-left-1'
                        } pointer-events-none`}
                      />

                      <div>
                        {/* Highlight Tag Pill inside Colored Shape */}
                        <span
                          style={{
                            backgroundColor: shapeTheme.tagBg,
                            color: shapeTheme.tagText,
                          }}
                          className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold mb-2"
                        >
                          {isEn ? rev.tagEn : rev.tagAr}
                        </span>

                        {/* Review Comment Text */}
                        <p className="type-sm font-bold text-[#01181E] leading-relaxed relative z-10">
                          «{isEn ? rev.textEn : rev.textAr}»
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#01181E]/12 flex items-center justify-between text-[11px] font-extrabold text-[#01181E]/80 relative z-10">
                        <span>{isEn ? 'SHAHEEQ V2 Kit' : 'شهيق V2 الأصلي'}</span>
                        <span>{isEn ? '24h Magnetic Hold' : 'ثبات ٢٤ ساعة'}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Compact Customer Portrait Avatar (56x56px)
 * Renders high-contrast illustrated human portraits matched by reviewer identity and gender
 * with zero fragile external image dependencies.
 */
const CustomerPortraitAvatar: React.FC<{
  reviewId: string;
  gender: 'male' | 'female';
  authorName: string;
  accentColor: string;
}> = ({ reviewId, gender, authorName, accentColor }) => {
  // Deterministic hash from reviewId for varied skin tones, hair styles, and shirt colors
  let hash = 0;
  for (let i = 0; i < reviewId.length; i++) {
    hash = (hash * 31 + reviewId.charCodeAt(i)) % 997;
  }

  const skinTones = ['#F1C27D', '#E0AC69', '#C68642', '#F5CBA7', '#D4A373'];
  const hairColors = ['#18181B', '#27272A', '#3F2E21', '#1E293B'];
  const shirtColors = ['#0F3D3E', '#1E3A8A', '#14532D', '#3B0764', '#312E81', '#064E3B'];

  const skin = skinTones[hash % skinTones.length];
  const hair = hairColors[(hash >> 2) % hairColors.length];
  const shirt = shirtColors[(hash >> 3) % shirtColors.length];
  const hasBeard = gender === 'male' && hash % 2 === 0;

  return (
    <div
      aria-label={authorName}
      className="relative w-full h-full bg-[#052933] flex items-center justify-center overflow-hidden"
    >
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full"
        role="img"
        aria-hidden="true"
      >
        <rect width="64" height="64" fill="#04222B" />
        <circle cx="32" cy="24" r="24" fill={accentColor} opacity="0.14" />

        {/* Shoulders / Athletic Top */}
        <path
          d="M10 64 C10 47, 54 47, 54 64 Z"
          fill={shirt}
        />
        <path
          d="M24 49 L32 56 L40 49"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Neck */}
        <rect x="27" y="38" width="10" height="10" rx="4" fill={skin} />

        {/* Female Hair Back */}
        {gender === 'female' && (
          <path
            d="M15 26 C14 40, 18 48, 22 50 L42 50 C46 48, 50 40, 49 26 Z"
            fill={hair}
          />
        )}

        {/* Head */}
        <ellipse cx="32" cy="27" rx="12.5" ry="14" fill={skin} />

        {/* Hair Crown */}
        {gender === 'female' ? (
          <path
            d="M19 25 C19 13, 45 13, 45 25 C42 19, 36 18, 32 18 C27 18, 22 19, 19 25 Z"
            fill={hair}
          />
        ) : (
          <path
            d="M19.5 23 C19.5 12.5, 44.5 12.5, 44.5 23 C42 17.5, 22 17.5, 19.5 23 Z"
            fill={hair}
          />
        )}

        {/* Eyes & Eyebrows */}
        <circle cx="27.5" cy="26.5" r="1.4" fill="#0F172A" />
        <circle cx="36.5" cy="26.5" r="1.4" fill="#0F172A" />
        <path
          d="M25 23.5 Q27.5 22.3 29.8 23.5"
          fill="none"
          stroke={hair}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M34.2 23.5 Q36.5 22.3 39 23.5"
          fill="none"
          stroke={hair}
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Subtle SHAHEEQ Magnetic Nasal Strip on Nose Bridge */}
        <rect
          x="28.2"
          y="28.2"
          width="7.6"
          height="2.4"
          rx="1.2"
          fill="#070707"
          stroke={accentColor}
          strokeWidth="0.7"
        />

        {/* Optional Short Beard for Male Portraits */}
        {hasBeard && (
          <path
            d="M21.5 31 C22 39, 42 39, 42.5 31 C40.5 35.5, 36.5 37.5, 32 37.5 C27.5 37.5, 23.5 35.5, 21.5 31 Z"
            fill={hair}
            opacity="0.82"
          />
        )}

        {/* Confident Smile */}
        <path
          d="M28.5 34 Q32 36.6 35.5 34"
          fill="none"
          stroke={hasBeard ? '#F8FAFC' : '#7C2D12'}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <div
        aria-hidden="true"
        style={{ borderColor: accentColor }}
        className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20"
      />
    </div>
  );
};
