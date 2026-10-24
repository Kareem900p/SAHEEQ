import React from 'react';
import { Truck } from 'lucide-react';

interface AnnouncementBarProps {
  freeShippingThreshold: number;
  currencySymbolAr: string;
  currentLanguage?: 'ar' | 'en';
  onOpenShippingPolicy: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  freeShippingThreshold,
  currentLanguage = 'ar',
  onOpenShippingPolicy,
}) => {
  const isEn = currentLanguage === 'en';

  return (
    <div
      id="announcement-bar"
      role="region"
      aria-label={isEn ? 'Free shipping notice' : 'إعلان الشحن المجاني'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="w-full min-h-[44px] bg-[#01181E] text-[#CEF90B] border-b border-[#CEF90B]/20 flex items-center justify-center overflow-hidden"
    >
      <div className="layout-container flex items-center justify-center">
        <button
          type="button"
          onClick={onOpenShippingPolicy}
          className="min-h-[44px] px-3 inline-flex items-center justify-center gap-2.5 text-center type-sm font-bold text-[#CEF90B] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#CEF90B] rounded-lg group"
        >
          <span className="relative flex items-center justify-center">
            <Truck
              className="w-4 h-4 text-[#CEF90B] shrink-0 animate-truck-glide"
              aria-hidden="true"
            />
          </span>
          <span>
            {isEn
              ? `Free shipping on orders over ${freeShippingThreshold} EGP`
              : `شحن مجاني للطلبات فوق ${freeShippingThreshold} جنيه`}
          </span>
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full bg-[#DDFE01] animate-breathe shrink-0"
          />
        </button>
      </div>
    </div>
  );
};
