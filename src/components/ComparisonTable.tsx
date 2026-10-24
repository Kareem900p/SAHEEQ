import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import {
  COMPARISON_COLUMNS,
  FOUR_REASONS_TO_CHOOSE,
  comparisonCriteria,
  type ComparisonCell,
} from '../data/comparisonData';

interface ComparisonTableProps {
  brandNameAr: string;
  brandNameEn: string;
  currentLanguage?: 'ar' | 'en';
  onCtaClick: () => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  currentLanguage = 'ar',
  onCtaClick,
}) => {
  const isEn = currentLanguage === 'en';

  const renderCellBadge = (cell: ComparisonCell, isBrandColumn: boolean) => {
    const circleStyle =
      cell.status === 'positive'
        ? 'bg-[#1D3E1E] text-[#CEF90B] border border-[#CEF90B]/40 shadow-[0_0_12px_rgba(206,249,11,0.18)]'
        : cell.status === 'neutral'
        ? 'bg-white/10 text-[#C2CFD4] border border-white/15'
        : 'bg-[#1C2A32] text-[#94A3B8] border border-white/10';

    const note = isEn ? cell.noteEn : cell.noteAr;

    return (
      <div className="flex flex-col items-center justify-center gap-1 py-1">
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center type-xs font-extrabold ${circleStyle} ${
            isBrandColumn && cell.status === 'positive' ? 'animate-breathe' : ''
          }`}
          aria-hidden="true"
        >
          {cell.status === 'positive' ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : cell.status === 'negative' ? (
            <X className="w-4 h-4 stroke-[2.75]" />
          ) : (
            <span className="text-sm font-extrabold leading-none">~</span>
          )}
        </span>
        {note && (
          <span
            className={`type-xs leading-tight text-center ${
              isBrandColumn
                ? 'font-bold text-[#DDFE01]'
                : 'font-medium text-[#C2CFD4]'
            }`}
          >
            {note}
          </span>
        )}
      </div>
    );
  };

  return (
    <section
      id="comparison-section"
      aria-label={isEn ? 'Comparison Table' : 'مقارنة الحلول'}
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
          <div className="px-4 py-1.5 rounded-lg bg-[#133320] text-[#DDFE01] type-xs font-bold mb-3 border border-[#DDFE01]/25">
            {isEn ? 'Clear Comparison' : 'الفرق من الآخر'}
          </div>

          <h2 className="type-h2 font-extrabold text-[#F4F3EF]">
            {isEn ? (
              <>
                Why <strong className="text-[#DDFE01]">SHAHEEQ</strong> Beats Regular Strips
              </>
            ) : (
              <>
                ليه تختار <strong className="text-[#DDFE01]">شهيق</strong> وتنسى اللزق العادي؟
              </>
            )}
          </h2>
        </motion.div>

        {/* 4 Short Reasons Grid with Staggered Entrance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {FOUR_REASONS_TO_CHOOSE.map((reason, idx) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-[#03232B] border border-white/12 hover:border-[#CEF90B]/40 transition-colors flex flex-col justify-between text-start shadow-lg"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#CEF90B] text-[#01181E] font-extrabold type-xs flex items-center justify-center mb-3 tabular-nums">
                  {reason.number}
                </div>
                <h3 className="type-h3 font-bold text-[#F4F3EF]">
                  {isEn ? reason.titleEn : reason.titleAr}
                </h3>
                <p className="type-body text-[#C2CFD4] mt-2">
                  {isEn ? reason.descriptionEn : reason.descriptionAr}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full rounded-2xl bg-[#03232B] border border-white/12 shadow-2xl overflow-hidden"
        >
          <div className="w-full overflow-x-auto">
            <table
              className="w-full min-w-[640px] border-collapse text-start"
              dir={isEn ? 'ltr' : 'rtl'}
            >
              <thead>
                <tr className="border-b border-white/10">
                  <th
                    scope="col"
                    className="py-4 px-4 sm:px-6 type-sm font-bold text-[#C2CFD4] w-[28%] sticky start-0 bg-[#03232B] z-10 text-start"
                  >
                    {isEn ? 'Feature' : 'الميزة'}
                  </th>
                  {COMPARISON_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={`py-4 px-3 text-center type-sm font-bold w-[18%] relative ${
                        col.isPrimaryBrand
                          ? 'bg-[#07302E] text-[#DDFE01] border-b-2 border-b-[#DDFE01]'
                          : 'text-[#C2CFD4]'
                      }`}
                    >
                      {isEn ? col.labelEn : col.labelAr}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {comparisonCriteria.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td
                      title={isEn ? row.descriptionEn : row.descriptionAr}
                      className="py-4 px-4 sm:px-6 type-sm font-bold text-[#F4F3EF] sticky start-0 bg-[#03232B] z-10 text-start"
                    >
                      {isEn ? row.featureNameEn : row.featureNameAr}
                    </td>

                    <td className="py-4 px-3 bg-[#07302E] text-center">
                      {renderCellBadge(row.shaheeq, true)}
                    </td>

                    <td className="py-4 px-3 text-center">
                      {renderCellBadge(row.regularStrips, false)}
                    </td>

                    <td className="py-4 px-3 text-center">
                      {renderCellBadge(row.internalClips, false)}
                    </td>

                    <td className="py-4 px-3 text-center">
                      {renderCellBadge(row.nasalSpray, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col items-center text-center">
          <button
            type="button"
            onClick={onCtaClick}
            className="min-h-[48px] px-8 rounded-full bg-[#DDFE01] hover:bg-[#CEF90B] text-[#01181E] type-btn font-extrabold shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            {isEn ? 'Pick Your Pack' : 'اختار عبوتك الآن'}
          </button>
        </div>
      </div>
    </section>
  );
};
