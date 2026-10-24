import React from 'react';
import { PackageCheck, Sparkles, Magnet, Maximize2, Crosshair } from 'lucide-react';
import { motion } from 'motion/react';
import { PACKAGE_COMPONENTS_LIST, type PackageComponentItem } from '../data/brandConfig';

interface VariantShowcaseProps {
  selectedVariantId: string;
  currentLanguage?: 'ar' | 'en';
  onSelectVariantAndScroll: (variantId: string) => void;
  onShopNowScroll: () => void;
}

export const VariantShowcase: React.FC<VariantShowcaseProps> = ({
  currentLanguage = 'ar',
}) => {
  const isEn = currentLanguage === 'en';

  const renderComponentVisual = (type: PackageComponentItem['visualType']) => {
    if (type === 'magnetic-tabs') {
      return (
        <div className="w-full aspect-[1.618/1] rounded-xl overflow-hidden bg-[#F4F7EE] border border-white/10 relative group-hover:border-[#CEF90B]/40 transition-colors">
          <img
            src="/assets/products/slide-1.jpg"
            alt={isEn ? '30 Magnetic Tabs' : '30 لاصقة مغناطيسية'}
            className="w-full h-full object-cover object-right transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    if (type === 'multi-size-clips') {
      return (
        <div className="w-full aspect-[1.618/1] rounded-xl overflow-hidden bg-[#F4F7EE] border border-white/10 relative group-hover:border-[#CEF90B]/40 transition-colors">
          <img
            src="/assets/products/slide-3.jpg"
            alt={isEn ? '4 Clip Sizes' : '4 مقاسات للمشابك'}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    return (
      <div className="w-full aspect-[1.618/1] rounded-xl overflow-hidden bg-[#F4F7EE] border border-white/10 relative group-hover:border-[#CEF90B]/40 transition-colors">
        <img
          src="/assets/products/slide-4.jpg"
          alt={isEn ? 'Magnetic Applicator' : 'أداة التثبيت المغناطيسية'}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  };

  const renderKineticBadgeIcon = (type: PackageComponentItem['visualType']) => {
    if (type === 'magnetic-tabs') {
      return <Magnet className="w-4 h-4 text-[#CEF90B] animate-magnetic-snap" />;
    }
    if (type === 'multi-size-clips') {
      return <Maximize2 className="w-4 h-4 text-[#CEF90B] animate-breathe" />;
    }
    return <Crosshair className="w-4 h-4 text-[#CEF90B] animate-wind-flow" />;
  };

  return (
    <section
      id="colors-showcase"
      aria-label={isEn ? 'What Is in the Box' : 'إيه جوه العبوة؟'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="w-full bg-[#01181E] py-12 sm:py-16 border-t border-white/10 overflow-hidden"
    >
      <div className="layout-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#133320] text-[#DDFE01] type-xs font-bold border border-[#DDFE01]/25 mb-3">
            <PackageCheck className="w-4 h-4 animate-breathe" />
            <span>{isEn ? 'Complete Starter Kit' : 'مجموعة البداية المتكاملة'}</span>
          </span>

          <h2 className="type-h2 font-extrabold text-[#F4F3EF]">
            {isEn ? 'What Is in the Box?' : 'إيه جوه العبوة؟'}
          </h2>
          <p className="mt-2 type-body text-[#C2CFD4] max-w-lg">
            {isEn
              ? 'Everything you need for 30 full days in one box.'
              : 'كل اللي محتاجه لـ 30 يوم كاملين في عبوة واحدة.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGE_COMPONENTS_LIST.map((comp, idx) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.55,
                delay: idx * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -5 }}
              className="group rounded-2xl bg-[#03232B] border border-white/12 p-6 flex flex-col justify-between text-start shadow-xl hover:border-[#CEF90B]/45 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-lg bg-[#CEF90B] text-[#01181E] font-extrabold type-xs tabular-nums">
                    {comp.numberBadge}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#01181E] border border-white/10 flex items-center justify-center">
                    {renderKineticBadgeIcon(comp.visualType)}
                  </div>
                </div>

                {renderComponentVisual(comp.visualType)}

                <h3 className="mt-4 type-h3 font-bold text-[#F4F3EF] flex items-center gap-2">
                  <span>{isEn ? comp.titleEn : comp.titleAr}</span>
                </h3>
                <p className="mt-1 type-xs font-bold text-[#CEF90B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{isEn ? comp.subtitleEn : comp.subtitleAr}</span>
                </p>
                <p className="mt-2 type-body text-[#C2CFD4]">
                  {isEn ? comp.detailsEn : comp.detailsAr}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
