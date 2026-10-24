import React from 'react';
import { Wind, Moon, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import type { BenefitItem } from '../data/brandConfig';

interface ProductBenefitsProps {
  benefits: BenefitItem[];
  currentLanguage?: 'ar' | 'en';
}

export const ProductBenefits: React.FC<ProductBenefitsProps> = ({
  benefits,
  currentLanguage = 'ar',
}) => {
  const isEn = currentLanguage === 'en';

  const renderAnimatedIcon = (type: BenefitItem['iconType']) => {
    switch (type) {
      case 'airflow':
        return (
          <Wind className="w-5 h-5 text-[#CEF90B] stroke-[2.2] shrink-0 animate-wind-flow" />
        );
      case 'sleep':
        return (
          <Moon className="w-5 h-5 text-[#CEF90B] stroke-[2.2] shrink-0 animate-sleep-float" />
        );
      case 'ergonomic':
      default:
        return (
          <ShieldCheck className="w-5 h-5 text-[#CEF90B] stroke-[2.2] shrink-0 animate-magnetic-snap" />
        );
    }
  };

  const renderKineticIndicator = (type: BenefitItem['iconType']) => {
    if (type === 'airflow') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#01181E] text-[#DDFE01] type-xs font-extrabold">
          <span className="w-2 h-2 rounded-full bg-[#DDFE01] animate-breathe" />
          <span>{isEn ? '+80% Airflow' : '+٨٠٪ تدفق هواء'}</span>
        </span>
      );
    }
    if (type === 'sleep') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#01181E] text-[#CEF90B] type-xs font-extrabold">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-breathe" />
          <span>{isEn ? 'Zero Snoring' : 'نوم بدون شخير'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#01181E] text-[#DDFE01] type-xs font-extrabold">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-breathe" />
        <span>{isEn ? '24h Sweatproof' : 'ثبات ٢٤ ساعة'}</span>
      </span>
    );
  };

  return (
    <section
      id="benefits-section"
      aria-label={isEn ? 'Key Benefits' : 'المميزات الأساسية'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="w-full bg-[#DDFE01] text-[#01181E] py-12 sm:py-16 overflow-hidden"
    >
      <div className="layout-container">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 border-b border-[#01181E]/15 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2"
        >
          <h2 className="type-h2 font-extrabold text-[#01181E]">
            {isEn ? 'Why Choose SHAHEEQ?' : 'ليه شهيق هيفرِق معاك؟'}
          </h2>
          <span className="type-sm font-bold text-[#01181E]/85">
            {isEn
              ? '24-hour adhesive hold = 30 full days of real use'
              : 'ثبات اللاصق 24 ساعة = 30 يوم استخدام فعلي'}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-[#01181E]/6 hover:bg-[#01181E]/10 border border-[#01181E]/14 transition-colors flex flex-col items-start justify-between gap-4"
            >
              <div className="w-full">
                <div className="w-full flex items-center justify-between gap-2 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#01181E] flex items-center justify-center shrink-0 shadow-md">
                    {renderAnimatedIcon(item.iconType)}
                  </div>
                  {renderKineticIndicator(item.iconType)}
                </div>

                <h3 className="type-h3 font-extrabold text-[#01181E]">
                  {isEn ? item.titleEn : item.titleAr}
                </h3>
                <p className="mt-2 type-body text-[#01181E]/90 font-medium">
                  {isEn ? item.descriptionEn : item.descriptionAr}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
