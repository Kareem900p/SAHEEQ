import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { FAQCategoryGroup } from '../data/faqData';

interface FAQSectionProps {
  categories: FAQCategoryGroup[];
  currentLanguage?: 'ar' | 'en';
  onExpandFaq: (faqId: string, questionAr: string) => void;
  onOpenContactModal: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  categories,
  currentLanguage = 'ar',
  onExpandFaq,
  onOpenContactModal,
}) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-what-is-in-box': true,
    'faq-price-and-shipping': true,
  });
  const isEn = currentLanguage === 'en';

  const toggleItem = (id: string, questionText: string) => {
    setOpenIds((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        onExpandFaq(id, questionText);
      }
      return { ...prev, [id]: nextState };
    });
  };

  return (
    <section
      id="faq-section"
      aria-label={isEn ? 'FAQ' : 'الأسئلة الشائعة'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="w-full bg-[#01181E] py-12 sm:py-16 border-t border-white/10 overflow-hidden"
    >
      <div className="layout-container">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center mb-10"
          >
            <span className="px-4 py-1.5 rounded-lg bg-[#133320] text-[#DDFE01] type-xs font-bold border border-[#DDFE01]/25 mb-3">
              {isEn ? 'Quick Answers' : 'إجابات سريعة'}
            </span>

            <h2 className="type-h2 font-extrabold text-[#F4F3EF]">
              {isEn ? 'Common Questions' : 'الأسئلة الشائعة'}
            </h2>
          </motion.div>

          <div className="space-y-8">
            {categories.map((group, groupIdx) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: groupIdx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <h3 className="type-sm font-bold text-[#CEF90B] pb-3 border-b border-white/12 mb-2">
                  {isEn ? group.categoryTitleEn : group.categoryTitleAr}
                </h3>

                <div className="divide-y divide-white/10">
                  {group.items.map((item) => {
                    const isOpen = !!openIds[item.id];
                    const qText = isEn ? item.questionEn : item.questionAr;
                    const aText = isEn ? item.answerEn : item.answerAr;

                    return (
                      <div key={item.id} className="py-3">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${item.id}`}
                          onClick={() => toggleItem(item.id, qText)}
                          className="w-full min-h-[48px] flex items-center justify-between gap-4 text-start group focus-visible:outline-2 focus-visible:outline-[#CEF90B] rounded-xl py-2 cursor-pointer"
                        >
                          <span className="type-body font-bold text-[#F4F3EF] group-hover:text-[#DDFE01] transition-colors">
                            {qText}
                          </span>

                          <span
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                              isOpen
                                ? 'bg-[#DDFE01] text-[#01181E] rotate-180'
                                : 'bg-[#092B34] text-[#DDFE01] group-hover:bg-[#103E4A]'
                            }`}
                            aria-hidden="true"
                          >
                            {isOpen ? (
                              <Minus className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            )}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={`faq-panel-${item.id}`}
                              role="region"
                              aria-label={qText}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pt-2 pb-1 pe-8 type-body text-[#C2CFD4]">
                                <p>{aText}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 rounded-2xl bg-[#03232B] border border-white/12 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start shadow-lg"
          >
            <p className="type-h3 font-bold text-[#F4F3EF]">
              {isEn ? 'Need more help?' : 'عندك سؤال تاني؟'}
            </p>
            <button
              type="button"
              onClick={onOpenContactModal}
              className="min-h-[48px] px-8 rounded-full bg-[#DDFE01] hover:bg-[#CEF90B] text-[#01181E] type-btn font-extrabold transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              {isEn ? 'Contact Us' : 'تواصل معنا'}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
