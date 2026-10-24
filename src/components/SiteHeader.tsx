import React from 'react';
import { Menu, ShoppingBag } from 'lucide-react';

interface SiteHeaderProps {
  brandNameAr: string;
  brandNameEn: string;
  logoPath: string;
  cartCount: number;
  currentLanguage: 'ar' | 'en';
  onToggleLanguage: () => void;
  onOpenMenu: () => void;
  onOpenCart: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  brandNameAr,
  brandNameEn,
  logoPath,
  cartCount,
  currentLanguage,
  onToggleLanguage,
  onOpenMenu,
  onOpenCart,
}) => {
  const isEn = currentLanguage === 'en';

  return (
    <header className="w-full h-[64px] bg-[#DDFE01] text-[#01181E] sticky top-0 z-40 border-b border-[#01181E]/10 shadow-xs transition-colors">
      <div
        dir={isEn ? 'ltr' : 'rtl'}
        className="layout-container h-full grid grid-cols-[1fr_auto_1fr] items-center gap-2"
      >
        {/* Start Zone: Menu Button (Unified mobile layout across Mobile, Tablet & Desktop) */}
        <div className="flex items-center gap-2 justify-start min-w-0">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label={isEn ? 'Open menu' : 'فتح القائمة'}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-[#01181E] hover:bg-[#01181E]/10 focus-visible:outline-2 focus-visible:outline-[#01181E] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Center Zone: Brand Logo Symbol Only across all viewports */}
        <div className="flex items-center justify-center shrink-0">
          <a
            href="#product-hero"
            aria-label={isEn ? `${brandNameEn} Home` : `${brandNameAr} - الرئيسية`}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center group focus-visible:outline-2 focus-visible:outline-[#01181E] rounded-xl px-2 py-1"
          >
            <img
              src={logoPath}
              alt={isEn ? brandNameEn : brandNameAr}
              className="h-8 w-auto object-contain transition-transform duration-150 group-hover:scale-105 shrink-0"
              referrerPolicy="no-referrer"
            />
          </a>
        </div>

        {/* End Zone: Compact Language Toggle (ع | EN) + Cart Button */}
        <div className="flex items-center justify-end gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            data-testid="language-switcher-btn"
            aria-label={isEn ? 'Switch language to Arabic' : 'تغيير اللغة إلى الإنجليزية'}
            className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[#01181E]/30 bg-[#01181E]/8 hover:bg-[#01181E]/15 type-xs font-bold text-[#01181E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className={!isEn ? 'font-extrabold underline underline-offset-4' : 'opacity-75'}>
              ع
            </span>
            <span className="opacity-40" aria-hidden="true">|</span>
            <span className={isEn ? 'font-extrabold underline underline-offset-4' : 'opacity-75'}>
              EN
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={isEn ? `Cart (${cartCount} items)` : `سلة التسوق (${cartCount})`}
            className="relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-[#01181E] hover:bg-[#01181E]/10 focus-visible:outline-2 focus-visible:outline-[#01181E] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {cartCount > 0 && (
              <span
                data-testid="header-cart-badge"
                className="absolute top-0.5 right-0.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#01181E] text-[#CEF90B] text-[11px] font-extrabold flex items-center justify-center tabular-nums shadow"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
