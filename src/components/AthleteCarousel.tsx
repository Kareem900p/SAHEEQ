import React from 'react';
import { Sparkles, Magnet, Wind, ArrowUpLeft, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { AthleteSlide } from '../data/brandConfig';

interface AthleteCarouselProps {
  slides?: AthleteSlide[];
  currentLanguage?: 'ar' | 'en';
  onCtaClick?: () => void;
}

interface HowItWorksStep {
  id: 'step-01' | 'step-02' | 'step-03';
  stepNumber: string;
  durationAr: string;
  durationEn: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  highlightAr: string;
  highlightEn: string;
}

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: 'step-01',
    stepNumber: '01',
    durationAr: '٥ ثوانٍ',
    durationEn: '5 Sec',
    titleAr: 'نظّف وجفّف الأنف',
    titleEn: 'Clean & Dry Nose',
    descAr: 'امسح جانبي الأنف جيداً لضمان أقصى ثبات للاصق الطبي طوال اليوم.',
    descEn: 'Wipe both sides of your nose clean for maximum all-day adhesive hold.',
    highlightAr: 'ثبات طبي آمن على البشرة',
    highlightEn: 'Skin-safe medical grip',
  },
  {
    id: 'step-02',
    stepNumber: '02',
    durationAr: '٥ ثوانٍ',
    durationEn: '5 Sec',
    titleAr: 'ثبّت اللاصق بالأداة',
    titleEn: 'Place Magnetic Tabs',
    descAr: 'استخدم أداة التركيب المغناطيسية لوضع لاصق صغير على كل جانب بدقة.',
    descEn: 'Use the magnetic applicator to place one micro-tab accurately on each side.',
    highlightAr: 'تركيب سريع بدون لمس اللاصق',
    highlightEn: 'Touch-free precision placement',
  },
  {
    id: 'step-03',
    stepNumber: '03',
    durationAr: 'فوري • ٢٤ ساعة',
    durationEn: 'Instant • 24h Hold',
    titleAr: 'ركّب المشبك وتنفس بحرية',
    titleEn: 'Snap Bridge & Breathe',
    descAr: 'قرّب المشبك ليلتصق مغناطيسياً ويفتح مجرى الهواء بنسبة ٨٠٪ أكثر فوراً.',
    descEn: 'Snap the magnetic bridge on to open your nasal airway by up to 80% instantly.',
    highlightAr: '+٨٠٪ تدفق هواء من أول ثانية',
    highlightEn: '+80% instant airflow boost',
  },
];

export const AthleteCarousel: React.FC<AthleteCarouselProps> = ({
  currentLanguage = 'ar',
  onCtaClick,
}) => {
  const isEn = currentLanguage === 'en';

  const handleOrderNowClick = () => {
    if (onCtaClick) {
      onCtaClick();
      return;
    }
    const heroEl = document.getElementById('product-hero');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="athletes-section"
      aria-label={isEn ? 'How It Works in 3 Steps' : 'طريقة الاستخدام في ٣ خطوات'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="w-full bg-[#01181E] py-12 sm:py-16 border-t border-white/10 overflow-hidden"
    >
      <div className="layout-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#CEF90B]/12 border border-[#CEF90B]/30 text-[#CEF90B] type-xs font-extrabold mb-3">
            <Sparkles className="w-4 h-4 animate-breathe" />
            <span>{isEn ? 'HOW IT WORKS • 15 SECONDS' : 'طريقة الاستخدام • ١٥ ثانية'}</span>
          </span>

          <h2 className="type-h2 font-extrabold text-[#F4F3EF]">
            {isEn ? '3 Steps to Instant Airflow' : '٣ خطوات.. ونَفَسك يتغير فوراً'}
          </h2>

          <p className="mt-3 type-body text-[#C2CFD4]">
            {isEn
              ? '15-second setup with 24-hour magnetic comfort for deep sleep and peak workouts.'
              : 'تركيب في ١٥ ثانية، وثبات مغناطيسي مريح يدوم ٢٤ ساعة للنوم والتمرين.'}
          </p>
        </motion.div>

        {/* 3-Step Visual Funnel Grid with Step-Specific Kinetic Diagrams */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <motion.article
              key={step.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -5 }}
              className="relative rounded-2xl bg-[#03232B] border border-white/12 hover:border-[#CEF90B]/45 transition-colors duration-300 flex flex-col overflow-hidden group shadow-lg"
            >
              {/* Top Step Bar */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#CEF90B] text-[#01181E] font-extrabold type-xs flex items-center justify-center shadow-sm tabular-nums">
                    {step.stepNumber}
                  </span>
                  <span className="type-xs font-bold text-[#C2CFD4]">
                    {isEn ? `STEP ${step.stepNumber}` : `الخطوة ${step.stepNumber}`}
                  </span>
                </div>

                <span className="type-xs font-bold px-3 py-1 rounded-lg bg-[#01181E] text-[#CEF90B] border border-[#CEF90B]/25">
                  {isEn ? step.durationEn : step.durationAr}
                </span>
              </div>

              {/* Technical Illustration Area — Golden Ratio Aspect (1.618 : 1) */}
              <div className="relative mx-6 my-2 rounded-xl bg-[#01181E] border border-white/10 aspect-[1.618/1] overflow-hidden flex items-center justify-center">
                <StepTechnicalIllustration stepId={step.id} isEn={isEn} />
              </div>

              {/* Step Copy */}
              <div className="p-6 pt-4 flex-1 flex flex-col justify-between text-start">
                <div>
                  <h3 className="type-h3 font-extrabold text-[#F4F3EF] flex items-center gap-2">
                    {index === 0 && (
                      <Sparkles className="w-5 h-5 text-[#CEF90B] shrink-0 animate-breathe" />
                    )}
                    {index === 1 && (
                      <Magnet className="w-5 h-5 text-[#CEF90B] shrink-0 animate-magnetic-snap" />
                    )}
                    {index === 2 && (
                      <Wind className="w-5 h-5 text-[#CEF90B] shrink-0 animate-wind-flow" />
                    )}
                    <span>{isEn ? step.titleEn : step.titleAr}</span>
                  </h3>
                  <p className="mt-2 type-body text-[#C2CFD4]">
                    {isEn ? step.descEn : step.descAr}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 type-xs font-bold text-[#CEF90B]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isEn ? step.highlightEn : step.highlightAr}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom Conversion Bar & Fast Order CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 rounded-2xl bg-gradient-to-r from-[#03232B] via-[#042B35] to-[#03232B] border border-[#CEF90B]/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-start">
            <div className="w-12 h-12 rounded-xl bg-[#CEF90B]/15 border border-[#CEF90B]/35 flex items-center justify-center text-[#CEF90B] shrink-0">
              <ShieldCheck className="w-6 h-6 animate-magnetic-snap" />
            </div>
            <div>
              <p className="type-h3 font-extrabold text-[#F4F3EF]">
                {isEn
                  ? '1 Pack = 30 Full Days • 4 Bridge Sizes Included'
                  : 'العبوة تكفي ٣٠ يوماً كاملاً • مع ٤ مقاسات لضبط راحتك'}
              </p>
              <p className="type-sm text-[#C2CFD4] mt-1">
                {isEn
                  ? '24-hour magnetic hold guarantee + Free shipping when you order 2+ packs.'
                  : 'ضمان ثبات مغناطيسي ٢٤ ساعة • شحن مجاني عند طلب عبوتين أو أكثر.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOrderNowClick}
            className="w-full sm:w-auto min-h-[48px] shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#DDFE01] hover:bg-[#CEF90B] active:scale-[0.99] text-[#01181E] type-btn font-extrabold transition-all cursor-pointer shadow-lg"
          >
            <span>
              {isEn ? 'Order Your Pack Now' : 'اطلب باقتك الآن'}
            </span>
            {isEn ? (
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <ArrowUpLeft className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const StepTechnicalIllustration: React.FC<{
  stepId: HowItWorksStep['id'];
  isEn: boolean;
}> = ({ stepId, isEn }) => {
  return (
    <svg
      viewBox="0 0 320 198"
      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
      role="img"
      aria-label={stepId}
    >
      <defs>
        <radialGradient id={`glow-${stepId}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#CEF90B" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#01181E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background Grid & Glow */}
      <rect width="320" height="198" fill="#01181E" />
      <circle
        cx="160"
        cy="99"
        r="95"
        fill={`url(#glow-${stepId})`}
        className="animate-breathe"
      />
      <g stroke="#FFFFFF" strokeOpacity="0.04" strokeWidth="1">
        <line x1="0" y1="50" x2="320" y2="50" />
        <line x1="0" y1="100" x2="320" y2="100" />
        <line x1="0" y1="150" x2="320" y2="150" />
        <line x1="80" y1="0" x2="80" y2="198" />
        <line x1="160" y1="0" x2="160" y2="198" />
        <line x1="240" y1="0" x2="240" y2="198" />
      </g>

      {/* Anatomical Nasal Contour */}
      <g transform="translate(160, 102)">
        <path
          d="M-24 -68 C-26 -25 -46 10 -48 36 C-49 52 -30 60 -16 54 C-6 50 6 50 16 54 C30 60 49 52 48 36 C46 10 26 -25 24 -68"
          fill="#052C36"
          stroke="#F4F3EF"
          strokeOpacity="0.28"
          strokeWidth="2"
        />
        <path
          d="M-10 -58 C-11 -20 -18 12 -18 32 M10 -58 C11 -20 18 12 18 32"
          fill="none"
          stroke="#F4F3EF"
          strokeOpacity="0.16"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* STEP 01 MOTION: Pulsing Clean Target Zones */}
        {stepId === 'step-01' && (
          <g>
            <circle
              cx="-28"
              cy="16"
              r="14"
              fill="#CEF90B"
              fillOpacity="0.14"
              stroke="#CEF90B"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              className="animate-breathe"
            />
            <circle
              cx="28"
              cy="16"
              r="14"
              fill="#CEF90B"
              fillOpacity="0.14"
              stroke="#CEF90B"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              className="animate-breathe"
            />
            <path
              d="M-28 8 L-28 24 M-36 16 L-20 16"
              stroke="#CEF90B"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M28 8 L28 24 M20 16 L36 16"
              stroke="#CEF90B"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <text
              x="0"
              y="-48"
              textAnchor="middle"
              fill="#CEF90B"
              fontSize="11"
              fontWeight="800"
            >
              {isEn ? 'CLEAN TARGET ZONES' : 'تنظيف جانبي الأنف'}
            </text>
          </g>
        )}

        {/* STEP 02 MOTION: Magnetic Applicator Tool Placing the Tab */}
        {stepId === 'step-02' && (
          <g>
            <ellipse
              cx="-28"
              cy="16"
              rx="11"
              ry="8"
              fill="#F4F3EF"
              stroke="#CEF90B"
              strokeWidth="1.5"
            />
            <circle cx="-28" cy="16" r="4" fill="#01181E" />

            <ellipse
              cx="28"
              cy="16"
              rx="11"
              ry="8"
              fill="#F4F3EF"
              stroke="#CEF90B"
              strokeWidth="1.5"
            />
            <circle cx="28" cy="16" r="4.5" fill="#CEF90B" className="animate-breathe" />

            <g className="animate-applicator-place">
              <rect
                x="4"
                y="-5"
                width="68"
                height="10"
                rx="5"
                fill="#0D1518"
                stroke="#CEF90B"
                strokeWidth="1.5"
              />
              <circle cx="8" cy="0" r="3" fill="#CEF90B" />
            </g>

            <text
              x="0"
              y="-48"
              textAnchor="middle"
              fill="#CEF90B"
              fontSize="11"
              fontWeight="800"
            >
              {isEn ? '2X MAGNETIC TABS' : 'تثبيت اللاصق المغناطيسي'}
            </text>
          </g>
        )}

        {/* STEP 03 MOTION: Outward Magnetic Pull + Upward Airflow Stream */}
        {stepId === 'step-03' && (
          <g>
            <ellipse cx="-30" cy="16" rx="10" ry="7.5" fill="#F4F3EF" />
            <ellipse cx="30" cy="16" rx="10" ry="7.5" fill="#F4F3EF" />

            <path
              d="M-30 16 C-30 -18 30 -18 30 16"
              fill="none"
              stroke="#0B0F12"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M-30 16 C-30 -18 30 -18 30 16"
              fill="none"
              stroke="#CEF90B"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            <circle cx="-30" cy="16" r="4.5" fill="#CEF90B" />
            <circle cx="30" cy="16" r="4.5" fill="#CEF90B" />

            {/* Outward Nasal Expansion Arrows */}
            <path
              d="M-44 16 L-58 16 M-53 11 L-58 16 L-53 21"
              fill="none"
              stroke="#CEF90B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pull-left"
            />
            <path
              d="M44 16 L58 16 M53 11 L58 16 L53 21"
              fill="none"
              stroke="#CEF90B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pull-right"
            />

            {/* Upward Nasal Airflow Stream Arrows */}
            <g className="animate-airflow-up">
              <path
                d="M-14 68 L-14 38 M-19 44 L-14 38 L-9 44"
                fill="none"
                stroke="#CEF90B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 68 L14 38 M9 44 L14 38 L19 44"
                fill="none"
                stroke="#CEF90B"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            <text
              x="0"
              y="-48"
              textAnchor="middle"
              fill="#CEF90B"
              fontSize="11"
              fontWeight="800"
            >
              {isEn ? '+80% INSTANT AIRFLOW' : '+٨٠٪ تدفق هواء فوري'}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
};
