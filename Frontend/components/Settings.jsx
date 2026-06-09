import React from 'react';

const Settings = ({ language, setLanguage }) => {
  return (
    <div className="space-y-10">
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
          {language === 'en' ? 'System Settings' : 'سسٹم کی ترتیبات'}
        </h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
          {language === 'en' ? 'Customize your experience' : 'اپنے تجربے کو اپنی مرضی کے مطابق بنائیں'}
        </p>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800">
              {language === 'en' ? 'Change Language' : 'زبان تبدیل کریں'}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              {language === 'en' ? 'Toggle between English and Urdu' : 'انگریزی اور اردو کے درمیان سوئچ کریں'}
            </p>
          </div>

          <button
            onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            className="bg-[#10b981] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all hover:-translate-y-1"
          >
            {language === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;