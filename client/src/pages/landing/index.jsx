import React, { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import AppImage from '../../components/AppImage';
import GlobalHeader from '../../components/ui/GlobalHeader';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const translations = {
  en: {
    headline: 'Connect Farmers and Buyers Across Ethiopia',
    subhead: 'Transparent prices, trusted profiles, and direct marketplace access.',
    ctaFarmer: 'I am a Farmer',
    ctaBuyer: 'I am a Buyer',
    featuresTitle: 'Why Ke Geberew',
    features: [
      { title: 'Fair Pricing', desc: 'Up-to-date market trends and pricing insights.' },
      { title: 'Direct Access', desc: 'Connect with buyers and farmers without middlemen.' },
      { title: 'Secure & Verified', desc: 'Verified users, reviews, and safe interactions.' },
    ],
    stats: [
      { value: '25k+', label: 'Active Users' },
      { value: '4.8★', label: 'Average Rating' },
      { value: '200+', label: 'Locations' },
      { value: '10k+', label: 'Monthly Trades' },
    ],
    howTitle: 'How it works',
    howSteps: [
      { title: 'Create your profile', desc: 'Sign up as a farmer or buyer in minutes.' },
      { title: 'List or search produce', desc: 'Post offers or discover fresh listings.' },
      { title: 'Connect and trade', desc: 'Chat, agree on terms, and complete the deal.' },
    ],
    testimonialsTitle: 'What our community says',
    testimonials: [
      { quote: 'Prices are fair and I find buyers faster than ever.', author: 'Alem, Farmer' },
      { quote: 'I can compare offers and buy directly from trusted farmers.', author: 'Mesfin, Buyer' },
    ],
    ctaBandTitle: 'Ready to grow with Ke Geberew?',
    ctaBandSub: 'Join thousands connecting across the country today.',
    footer: 'Built for Ethiopian agriculture',
    switchToAmharic: 'አማርኛ',
  },
  am: {
    headline: 'ገበሬዎችን እና ገዢዎችን በኢትዮጵያ ውስጥ ያገናኙ',
    subhead: 'ግልጽ ዋጋዎች፣ የሚታመኑ መገለጫዎች እና ቀጥታ ገበያ መዳረሻ።',
    ctaFarmer: 'እኔ ገበሬ ነኝ',
    ctaBuyer: 'እኔ ገዢ ነኝ',
    featuresTitle: 'ለምን Ke Geberew',
    features: [
      { title: 'ነፃነት ያለው ዋጋ', desc: 'ዘመናዊ የገበያ አዝማሚያ እና ዋጋ መረጃዎች።' },
      { title: 'ቀጥታ መዳረሻ', desc: 'በማካካሻ ሳይኖር ከገበሬዎች እና ገዢዎች ጋር ይገናኙ።' },
      { title: 'ደህንነት እና ማረጋገጫ', desc: 'የተረጋገጡ ተጠቃሚዎች፣ ግምገማዎች እና ደህንነት ያለው ግንኙነት።' },
    ],
    stats: [
      { value: '25k+', label: 'ንቁ ተጠቃሚዎች' },
      { value: '4.8★', label: 'አማካይ ከተወሰነ ግምገማ' },
      { value: '200+', label: 'ቦታዎች' },
      { value: '10k+', label: 'ወርሃዊ ንግዶች' },
    ],
    howTitle: 'እንዴት ይሰራ',
    howSteps: [
      { title: 'መገለጫ ይክፈቱ', desc: 'እንደ ገበሬ ወይም ገዢ በፍጥነት ይመዝገቡ።' },
      { title: 'ምርት ይጨምሩ ወይም ይፈልጉ', desc: 'ማቅረብ ይለጥፉ ወይም አዳዲስ ልማዶችን ይፈልጉ።' },
      { title: 'ይገናኙ እና ይንገዱ', desc: 'ይወያዩ፣ ሁኔታዎችን ይግባባዩ እና ንግዱን ይጠናቀቁ።' },
    ],
    testimonialsTitle: 'የማህበረሰባችን አስተያየት',
    testimonials: [
      { quote: 'ዋጋዎቹ ፍትሃዊ ናቸው እና ገዢዎችን በፍጥነት እገኛለሁ።', author: 'አለም፣ ገበሬ' },
      { quote: 'አቅርቦቶችን እንደምን እንደምን እንደ ተረጋገጡ ገበሬዎች በቀጥታ ማግኘት እችላለሁ።', author: 'መስፍን፣ ገዢ' },
    ],
    ctaBandTitle: 'ዝግጁ ነዎት? ከ Ke Geberew ጋር ይድጋጉ',
    ctaBandSub: 'ዛሬ በአገር ዙሪያ የሚገናኙ አስር ሺህ ይቀላቀሉ።',
    footer: 'ለኢትዮጵያ ግብርና የተገነባ',
    switchToAmharic: 'English',
  },
};

const getInitialLanguage = () => {
  const saved = localStorage.getItem('landingLanguage');
  if (saved === 'en' || saved === 'am') return saved;
  return 'en';
};

const LandingPage = () => {
  const { language, setLanguage } = useLanguage();
  const [lang, setLang] = useState(getInitialLanguage());

  useEffect(() => {
    localStorage.setItem('landingLanguage', lang);
    if (language !== lang) setLanguage(lang);
  }, [lang]);

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-emerald-50">
      <GlobalHeader currentLanguage={lang} onLanguageChange={setLang} publicOnly={true} />

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 md:px-10 lg:px-16 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <svg className="pointer-events-none absolute -top-10 -right-10 opacity-20" width="360" height="360" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <path fill="url(#grad)" d="M45.9,-54.6C59.8,-45.6,70.1,-30.4,73.6,-14C77.1,2.4,73.9,20.1,64.9,34.3C55.9,48.6,41.2,59.3,25.1,64.7C9,70.1,-8.6,70.3,-24.9,64.2C-41.2,58.1,-56.1,45.8,-64.7,29.9C-73.3,14,-75.6,-5.5,-69.8,-22C-64,-38.5,-50.1,-51.9,-35.1,-60.9C-20.1,-69.9,-10.1,-74.6,3.2,-78.7C16.5,-82.8,33.1,-86.4,45.9,-54.6Z" transform="translate(100 100)" />
          </svg>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900">
              {t.headline}
            </h1>
            <p className="mt-4 text-gray-600 md:text-lg">
              {t.subhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="shadow hover:shadow-md transition-shadow">
                <a href="/authentication-login-register?role=farmer" className="">{t.ctaFarmer}</a>
              </Button>
              <Button variant="outline" asChild className="hover:-translate-y-0.5 transition-transform">
                <a href="/authentication-login-register?role=buyer">{t.ctaBuyer}</a>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-emerald-100 blur-2xl" />
            <div className="relative rounded-3xl border bg-white p-4 shadow-sm hover:shadow-lg transition-shadow">
              {
                /* Allow overriding via env var if local file not available */
              }
              <AppImage
                src={import.meta.env.VITE_LANDING_HERO_URL || "/assets/images/landing_hero.jpg"}
                alt="market"
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {t.stats.map((s, i) => (
              <div key={i} className="rounded-2xl border bg-white p-6 text-center hover:-translate-y-0.5 transition-transform">
                <div className="text-2xl md:text-3xl font-bold text-emerald-700">{s.value}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-12">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{t.featuresTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {t.features.map((f, idx) => (
              <div key={idx} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-12 bg-white">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{t.howTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {t.howSteps.map((step, i) => (
              <div key={i} className="rounded-2xl border p-6 hover:-translate-y-0.5 transition-transform">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">{i + 1}</div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-12">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{t.testimonialsTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.testimonials.map((tm, i) => (
              <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-gray-800 italic">“{tm.quote}”</p>
                <div className="mt-3 text-sm text-gray-600">— {tm.author}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-10 lg:px-16 py-10">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 md:p-10 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold">{t.ctaBandTitle}</h3>
              <p className="mt-1 text-white/90">{t.ctaBandSub}</p>
            </div>
            <div className="flex gap-3">
              <a href="/authentication-login-register?role=farmer" className="bg-white text-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors">{t.ctaFarmer}</a>
              <a href="/authentication-login-register?role=buyer" className="border border-white text-white px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors">{t.ctaBuyer}</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 md:px-10 lg:px-16 py-6 border-t bg-white text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>{t.footer}</span>
          <a href="/app" className="text-emerald-700 hover:underline">Go to App →</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


