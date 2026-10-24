import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface SiteFooterProps {
  brandNameAr: string;
  brandNameEn: string;
  currentLanguage: 'ar' | 'en';
  onToggleLanguage: () => void;
  onNewsletterSignup: (email: string) => void;
  onOpenPolicyModal: (policyType: 'privacy' | 'refund' | 'shipping' | 'contact') => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({
  brandNameAr,
  brandNameEn,
  currentLanguage,
  onToggleLanguage,
  onNewsletterSignup,
  onOpenPolicyModal,
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const isEn = currentLanguage === 'en';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      setStatus('error');
      return;
    }
    onNewsletterSignup(trimmed);
    setStatus('success');
    setEmail('');
  };

  return (
    <footer
      aria-label={isEn ? 'Footer' : 'تذييل الصفحة'}
      dir={isEn ? 'ltr' : 'rtl'}
      className="w-full bg-[#01181E] text-[#F4F3EF] pt-12 pb-24 sm:pb-12 border-t border-white/10"
    >
      <div className="layout-container">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pb-10">
          {/* Newsletter Block */}
          <div className="w-full md:w-[380px] text-start">
            <h2 className="type-h3 font-bold text-[#F4F3EF] mb-3">
              {isEn ? 'Get Exclusive Offers' : 'اشترك للعروض الحصرية'}
            </h2>

            <form onSubmit={handleSubmit} noValidate className="relative">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                {isEn ? 'Your Email' : 'بريدك الإلكتروني'}
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                }}
                placeholder={isEn ? 'Your Email' : 'بريدك الإلكتروني'}
                className="w-full h-12 bg-transparent border border-[#F4F3EF]/35 focus:border-[#CEF90B] rounded-xl px-4 pe-14 type-sm text-[#F4F3EF] placeholder:text-[#C2CFD4]/70 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                aria-label={isEn ? 'Join' : 'اشترك'}
                className="absolute end-1 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#F4F3EF] hover:text-[#CEF90B] transition-colors cursor-pointer rounded-lg"
              >
                {isEn ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </button>
            </form>

            {status === 'error' && (
              <div role="alert" className="mt-2 flex items-center gap-1.5 type-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{isEn ? 'Please enter a valid email.' : 'اكتب بريد إلكتروني صحيح.'}</span>
              </div>
            )}

            {status === 'success' && (
              <div role="status" className="mt-2 flex items-center gap-1.5 type-xs text-[#CEF90B]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isEn ? 'Subscribed!' : 'تم الاشتراك بنجاح!'}</span>
              </div>
            )}
          </div>

          {/* Language Switcher + Payment Methods */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onToggleLanguage}
              className="min-h-[44px] px-4 rounded-xl border border-white/25 hover:border-[#CEF90B] inline-flex items-center gap-2 type-xs font-bold text-[#F4F3EF] transition-colors cursor-pointer"
            >
              <span className={!isEn ? 'text-[#CEF90B] font-extrabold' : 'opacity-75'}>العربية</span>
              <span className="opacity-35">|</span>
              <span className={isEn ? 'text-[#CEF90B] font-extrabold' : 'opacity-75'}>EN</span>
            </button>

            <span className="min-h-[44px] px-4 rounded-xl bg-white/5 border border-white/12 inline-flex items-center type-xs font-semibold text-[#C2CFD4]">
              {isEn ? 'Cash on Delivery (COD)' : 'الدفع عند الاستلام'}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-white/10" />

      <div className="layout-container pt-6 flex flex-wrap items-center justify-between gap-4 type-xs text-[#C2CFD4]">
        <span className="font-semibold">
          © {new Date().getFullYear()} {isEn ? brandNameEn : brandNameAr}
        </span>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => onOpenPolicyModal('shipping')}
            className="min-h-[44px] px-2 inline-flex items-center hover:text-[#CEF90B] font-semibold cursor-pointer"
          >
            {isEn ? 'Shipping' : 'الشحن'}
          </button>
          <button
            type="button"
            onClick={() => onOpenPolicyModal('refund')}
            className="min-h-[44px] px-2 inline-flex items-center hover:text-[#CEF90B] font-semibold cursor-pointer"
          >
            {isEn ? 'Returns' : 'الاستبدال'}
          </button>
          <button
            type="button"
            onClick={() => onOpenPolicyModal('privacy')}
            className="min-h-[44px] px-2 inline-flex items-center hover:text-[#CEF90B] font-semibold cursor-pointer"
          >
            {isEn ? 'Privacy' : 'الخصوصية'}
          </button>
          <button
            type="button"
            onClick={() => onOpenPolicyModal('contact')}
            className="min-h-[44px] px-2 inline-flex items-center hover:text-[#CEF90B] font-semibold cursor-pointer"
          >
            {isEn ? 'Contact' : 'تواصل معنا'}
          </button>
        </div>
      </div>
    </footer>
  );
};
