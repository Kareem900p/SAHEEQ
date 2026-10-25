import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Search } from 'lucide-react';

export interface GovernorateOption {
  ar: string;
  en: string;
  isQuick?: boolean;
}

export const EGYPT_GOVERNORATES_LIST: GovernorateOption[] = [
  { ar: 'القاهرة', en: 'Cairo', isQuick: true },
  { ar: 'الجيزة', en: 'Giza', isQuick: true },
  { ar: 'الإسكندرية', en: 'Alexandria', isQuick: true },
  { ar: 'القليوبية', en: 'Qalyubia', isQuick: true },
  { ar: 'الدقهلية', en: 'Dakahlia', isQuick: true },
  { ar: 'الشرقية', en: 'Sharqia', isQuick: true },
  { ar: 'الغربية', en: 'Gharbia' },
  { ar: 'المنوفية', en: 'Monufia' },
  { ar: 'البحيرة', en: 'Beheira' },
  { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' },
  { ar: 'دمياط', en: 'Damietta' },
  { ar: 'بورسعيد', en: 'Port Said' },
  { ar: 'الإسماعيلية', en: 'Ismailia' },
  { ar: 'السويس', en: 'Suez' },
  { ar: 'الفيوم', en: 'Faiyum' },
  { ar: 'بني سويف', en: 'Beni Suef' },
  { ar: 'المنيا', en: 'Minya' },
  { ar: 'أسيوط', en: 'Assiut' },
  { ar: 'سوهاج', en: 'Sohag' },
  { ar: 'قنا', en: 'Qena' },
  { ar: 'الأقصر', en: 'Luxor' },
  { ar: 'أسوان', en: 'Aswan' },
  { ar: 'البحر الأحمر', en: 'Red Sea' },
  { ar: 'مطروح', en: 'Matrouh' },
  { ar: 'شمال سيناء', en: 'North Sinai' },
  { ar: 'جنوب سيناء', en: 'South Sinai' },
  { ar: 'الوادي الجديد', en: 'New Valley' },
];

interface GovernorateSelectProps {
  id?: string;
  value: string;
  onChange: (newGovernorateAr: string) => void;
  isEn?: boolean;
  isFreeShipping?: boolean;
  cairoFee?: number;
  otherGovFee?: number;
}

export const GovernorateSelect: React.FC<GovernorateSelectProps> = ({
  id = 'modal-governorate',
  value,
  onChange,
  isEn = false,
  isFreeShipping = false,
  cairoFee = 85,
  otherGovFee = 95,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedGov =
    EGYPT_GOVERNORATES_LIST.find((g) => g.ar === value) || EGYPT_GOVERNORATES_LIST[0];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredGovernorates = normalizedQuery
    ? EGYPT_GOVERNORATES_LIST.filter(
        (g) =>
          g.ar.includes(normalizedQuery) ||
          g.en.toLowerCase().includes(normalizedQuery)
      )
    : EGYPT_GOVERNORATES_LIST;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getShippingBadgeText = (govAr: string) => {
    if (isFreeShipping) {
      return isEn ? 'Free Shipping' : 'شحن مجاني';
    }
    const fee = govAr === 'القاهرة' ? cairoFee : otherGovFee;
    return isEn ? `${fee} EGP` : `${fee} ج.م`;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input type="hidden" name="governorate" value={selectedGov.ar} />

      {/* Main Governorate Trigger Button */}
      <button
        id={id}
        type="button"
        data-testid={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) setSearchQuery('');
        }}
        className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#01181E] border transition-all flex items-center justify-between gap-2 text-start cursor-pointer ${
          isOpen
            ? 'border-[#DDFE01] ring-2 ring-[#DDFE01]/25'
            : 'border-white/25 hover:border-[#CEF90B]/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-[#CEF90B]/15 text-[#CEF90B] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </span>
          <span className="type-sm font-extrabold text-[#F4F3EF] truncate">
            {isEn ? selectedGov.en : selectedGov.ar}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
              isFreeShipping
                ? 'bg-[#DDFE01]/20 text-[#DDFE01]'
                : 'bg-white/10 text-[#C2CFD4]'
            }`}
          >
            {getShippingBadgeText(selectedGov.ar)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#CEF90B] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Quick-Select Top Governorates Row (Always visible for 1-Tap selection) */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {EGYPT_GOVERNORATES_LIST.filter((g) => g.isQuick).map((gov) => {
          const isSelected = gov.ar === selectedGov.ar;
          return (
            <button
              key={gov.ar}
              type="button"
              onClick={() => {
                onChange(gov.ar);
                setIsOpen(false);
              }}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#DDFE01] text-[#01181E] shadow-xs'
                  : 'bg-[#01181E]/90 text-[#C2CFD4] border border-white/12 hover:border-[#CEF90B]/45 hover:text-[#F4F3EF]'
              }`}
            >
              {isEn ? gov.en : gov.ar}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#032833] text-[#CEF90B] border border-[#CEF90B]/35 hover:bg-[#CEF90B]/15 transition-colors cursor-pointer"
        >
          {isOpen
            ? isEn
              ? 'Close list ▲'
              : 'إغلاق القائمة ▲'
            : isEn
            ? 'All 27 Governorates ▼'
            : 'كل المحافظات (27) ▼'}
        </button>
      </div>

      {/* Expandable Searchable Dropdown Panel for All 27 Governorates */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={isEn ? 'Select Governorate' : 'اختر المحافظة'}
          className="mt-2 w-full rounded-xl bg-[#01181E] border-2 border-[#CEF90B]/60 shadow-2xl overflow-hidden z-40"
        >
          {/* Search Input inside Dropdown */}
          <div className="p-2 border-b border-white/10 bg-[#021E26]">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#C2CFD4] absolute start-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search governorate...' : 'ابحث عن محافظتك...'}
                className="w-full h-9 ps-9 pe-3 rounded-lg bg-[#01181E] border border-white/15 type-xs text-[#F4F3EF] placeholder:text-[#C2CFD4]/60 focus:border-[#CEF90B] focus:outline-none"
              />
            </div>
          </div>

          {/* Scrollable List of 27 Governorates */}
          <div className="max-h-52 overflow-y-auto divide-y divide-white/5 p-1">
            {filteredGovernorates.length === 0 ? (
              <div className="py-4 text-center type-xs text-[#C2CFD4]">
                {isEn ? 'No matching governorate' : 'لا توجد محافظة مطابقة للبحث'}
              </div>
            ) : (
              filteredGovernorates.map((gov) => {
                const isSelected = gov.ar === selectedGov.ar;
                return (
                  <button
                    key={gov.ar}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(gov.ar);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center justify-between gap-2 text-start transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#DDFE01] text-[#01181E] font-extrabold'
                        : 'text-[#F4F3EF] hover:bg-white/8 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="type-xs">
                        {isEn ? gov.en : gov.ar}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-extrabold ${
                          isSelected ? 'text-[#01181E]' : 'text-[#CEF90B]'
                        }`}
                      >
                        {getShippingBadgeText(gov.ar)}
                      </span>
                      {isSelected && <Check className="w-4 h-4 stroke-[3] text-[#01181E]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
