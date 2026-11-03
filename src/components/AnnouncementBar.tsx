import React from 'react';
import { Truck } from 'lucide-react';

interface AnnouncementBarProps {
  freeShippingThreshold: number;
  currencySymbolAr: string;
  currentLanguage?: 'ar' | 'en';
  onOpenShippingPolicy: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  currentLanguage = 'ar',
  onOpenShippingPolicy,
}) => {
  const isEn = currentLanguage === 'en';

  return (
    <div
      id="announcement-bar"
      role="region"
      aria-label={isEn ? 'Fast 48h delivery notice' : 'توصيل في 48 ساعة لحد قدام بيتك'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="w-full min-h-[44px] bg-[#01181E] text-[#CEF90B] border-b border-[#CEF90B]/20 flex items-center justify-center overflow-hidden"
    >
      <div className="layout-container flex items-center justify-center">
        <button
          type="button"
          onClick={onOpenShippingPolicy}
          className="min-h-[44px] px-3 inline-flex items-center justify-center gap-2.5 text-center type-sm font-extrabold text-[#CEF90B] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#CEF90B] rounded-lg group"
        >
          <span className="relative flex items-center justify-center">
            <Truck
              className="w-4 h-4 text-[#CEF90B] shrink-0 animate-truck-glide"
              aria-hidden="true"
            />
          </span>
          <span data-testid="announcement-bar-text">
            {isEn
              ? 'Delivery in 48 hours right to your door'
              : 'توصيل في 48 ساعة لحد قدام بيتك'}
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
