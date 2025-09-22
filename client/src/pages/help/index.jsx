import React from 'react';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const faqs = [
  { qEn: 'How do I change my language?', qAm: 'ቋንቋዬን እንዴት እቀይራለሁ?', aEn: 'Use the globe icon in the top bar to toggle EN/አማ.', aAm: 'በላይ ባለው የምዕራብ ምልክት በመጠቀም EN/አማ ይቀይሩ.' },
  { qEn: 'How do I contact a farmer?', qAm: 'ገበሬን እንዴት እነግራለሁ?', aEn: 'Open a listing and use the contact button or phone number.', aAm: 'ዝርዝሩን ይክፈቱ እና የመገናኛ አዝራር ወይም ስልክ ቁጥር ይጠቀሙ.' },
  { qEn: 'Why can’t I create listings as a buyer?', qAm: 'እንዴት እንደ ገዢ ዝርዝር ማተም አልቻልኩም?', aEn: 'Only farmers can create listings. Buyers can place orders from listings.', aAm: 'ዝርዝር መፍጠር ለገበሬዎች ብቻ ነው። ገዢዎች ከዝርዝሮች ማዘዝ ይችላሉ።' },
];

const HelpPage = () => {
  const { language } = useLanguage();
  const t = (en, am) => (language === 'am' ? am : en);

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Icon name="HelpCircle" size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-text-primary">{t('Help & Support', 'እርዳታ እና ድጋፍ')}</h1>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">{t('Frequently Asked Questions', 'ብዛት የሚጠየቁ ጥያቄዎች')}</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="border-b last:border-b-0 border-border pb-4">
                <div className="font-medium text-text-primary">{t(f.qEn, f.qAm)}</div>
                <div className="text-sm text-text-secondary mt-1">{t(f.aEn, f.aAm)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">{t('Contact us', 'አግኙን')}</h2>
          <p className="text-sm text-text-secondary mb-4">{t('Email us at support@example.com or send a message below.', 'በ support@example.com ይጻፉ ወይም መልዕክት ይላኩ።')}</p>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert(t('Message sent!', 'መልዕክት ተልኳል!')); }}>
            <input className="w-full h-10 px-3 border border-border rounded-lg" placeholder={t('Subject', 'ርዕስ')} />
            <textarea className="w-full h-32 p-3 border border-border rounded-lg" placeholder={t('Your message', 'መልዕክትዎ')} />
            <Button variant="primary" iconName="Send" iconPosition="left">{t('Send', 'ላክ')}</Button>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default HelpPage;


