import React, { useState, useEffect } from "react";

const TopBar = ({ isSidebarOpen, setIsSidebarOpen, user: propUser, language }) => {
  const [currentDate, setCurrentDate] = useState("");
  // --- FIX: Local state specifically for session handling ---
  const [sessionUser, setSessionUser] = useState({ name: "", role: "" });
  const isUrdu = language === 'ur';

  useEffect(() => {
    // تاریخ اور وقت کا انتظام
    const locale = isUrdu ? 'ur-PK' : 'en-US';
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    const today = new Intl.DateTimeFormat(locale, options).format(new Date());
    setCurrentDate(today);

    // --- FIX: Logic to extract 'TeamAlpha' from nested JSON ---
    const rawData = localStorage.getItem('userSession');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        // Checking for nested 'user' object as seen in your JSON
        const userData = parsed.user || {}; 
        
        setSessionUser({
          name: userData.name || "Administrator",
          role: userData.role || "Staff"
        });
      } catch (err) {
        console.error("Session sync error:", err);
      }
    }
  }, [language, isUrdu, propUser]);

  // Priority: Prop User > Session User > Default
  const displayName = propUser?.name || sessionUser.name;
  const displayRole = propUser?.role || sessionUser.role;
  const firstLetter = displayName ? displayName.charAt(0).toUpperCase() : "A";

  return (
    <header 
      className={`h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-20 shadow-sm shrink-0`} 
      style={{ direction: isUrdu ? 'rtl' : 'ltr' }} 
    >
      
      {/* 1. لیفٹ سائیڈ */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 rounded-xl border border-gray-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95"
        >
          {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div className={isUrdu ? "text-right" : "text-left"}>
          <h2 className={`text-slate-800 font-black leading-tight tracking-tight ${isUrdu ? 'text-xl' : 'text-lg'}`}>
            {isUrdu ? 'سمارٹ پولیو ریکارڈ پورٹل' : 'Smart Polio Monitoring Portal'}
          </h2>
          <div className={`flex items-center gap-2 text-slate-400 text-[12px] font-bold uppercase tracking-wider mt-0.5 ${isUrdu ? 'flex-row-reverse' : ''}`}>
            <span>{currentDate}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-emerald-500 italic font-medium">
                {isUrdu ? 'سسٹم آن لائن ہے' : 'System Online'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. رائٹ سائیڈ */}
      <div className="flex items-center">
        <div className={`flex items-center gap-5 ${isUrdu ? 'pr-6 border-r-2' : 'pl-6 border-l-2'} border-slate-100`}>
          
          <div className="text-right">
            <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1 block">
              {isUrdu ? 'مجاز صارف' : 'Authorized User'}
            </span>
            {/* Dynamic Name Fix */}
            <p className="text-slate-800 font-black text-base leading-none capitalize tracking-tight">
              {displayName}
            </p>
            <div className={`flex items-center gap-1.5 mt-1.5 ${isUrdu ? 'justify-start' : 'justify-end'}`}>
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                {displayRole === 'Staff' && isUrdu ? 'فیلڈ اسٹاف' : displayRole}
               </p>
            </div>
          </div>

          {/* پروفائل آئیکن */}
          <div className="relative group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg flex items-center justify-center border-2 border-white ring-2 ring-emerald-500/20 transition-all duration-300">
              <span className="text-white text-xl font-black">
                {firstLetter}
              </span>
            </div>
            <div className={`absolute top-0 ${isUrdu ? 'left-0' : 'right-0'} w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm`}>
                <div className="w-full h-full bg-emerald-500 rounded-full"></div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

/* --- Icons --- */
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
);

export default TopBar;