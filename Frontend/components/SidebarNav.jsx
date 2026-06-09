import React from "react";

const SidebarNav = ({ activePage, setActivePage, onLogout, language }) => {
  // Navigation items with translations
  const mainNavItems = [
    { label: "Dashboard", ur: "ڈیش بورڈ", icon: <DashboardIcon /> },
    { label: "Priority Triage", ur: "ترجیحی ترتیب", icon: <TriageIcon /> },
    { label: "Child Registry", ur: "بچوں کا اندراج", icon: <ChildRegistryIcon /> },
    { label: "Certificates", ur: "سرٹیفکیٹ", icon: <CertificateIcon /> },
    { label: "Learn / Training", ur: "تربیت", icon: <LearnIcon /> },
    { label: "Field Teams", ur: "فیلڈ ٹیمیں", icon: <FieldTeamsIcon /> },
    { label: "Analytics", ur: "تجزیات", icon: <AnalyticsIcon /> },
  ];

  return (
    <aside className="w-[360px] h-screen bg-white border-r border-gray-200 flex flex-col font-sans select-none overflow-hidden">
      <div className="bg-gradient-to-r from-[#22c55e] via-[#10b981] to-[#3b82f6] p-6 flex items-center gap-4 shadow-md z-10">
        <div className="bg-white p-2 rounded-xl shadow-sm">
          <svg className="w-9 h-9 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <div className="shrink-0">
          <h1 className="text-white font-black text-[19px] leading-tight tracking-tight">
            {language === 'en' ? 'Smart Polio Portal' : 'سمارٹ پولیو پورٹل'}
          </h1>
          <p className="text-white/90 text-[12px] font-bold tracking-wide mt-0.5 uppercase">
            {language === 'en' ? 'Record & Monitoring' : 'ریکارڈ اور نگرانی'}
          </p>
        </div>
      </div>

      <nav className="flex-1 py-8 px-5 space-y-3 overflow-y-auto bg-white custom-scrollbar">
        {mainNavItems.map((item, index) => {
          const isActive = activePage === item.label;
          return (
            <button
              key={index}
              onClick={() => setActivePage(item.label)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border border-transparent transition-all duration-200 group
                ${isActive 
                  ? "bg-[#10b981] text-white shadow-[6px_6px_0px_0px_rgba(16,185,129,0.2)] -translate-y-1" 
                  : "text-slate-600 hover:bg-[#10b981] hover:text-white"
                }`}
            >
              <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}>
                {item.icon}
              </span>
              <span className={`text-[15.5px] tracking-wide uppercase ${isActive ? "font-black" : "font-medium"}`}>
                {language === 'en' ? item.label : item.ur}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-5 border-t border-gray-100 space-y-3 bg-gray-50/80">
        {/* Settings Button now triggers setActivePage */}
        <button 
          onClick={() => setActivePage("Settings")}
          className={`w-full flex items-center gap-4 p-3.5 rounded-xl border border-transparent transition-all duration-200 group 
            ${activePage === "Settings" ? "bg-[#10b981] text-white" : "text-slate-600 hover:bg-[#10b981] hover:text-white"}`}
        >
          <span className={activePage === "Settings" ? "text-white" : "text-slate-400 group-hover:text-white"}>
            <SettingsIcon />
          </span>
          <span className="text-[15px] font-medium uppercase tracking-wide">
            {language === 'en' ? 'Settings' : 'ترتیبات'}
          </span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 p-3.5 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 group"
        >
          <span className="group-hover:text-white"><SignOutIcon /></span>
          <span className="text-[15px] font-black uppercase tracking-wide">
            {language === 'en' ? 'Sign Out' : 'سائن آؤٹ'}
          </span>
        </button>
      </div>
    </aside>
  );
};

/* --- SVGs Icons --- */
const DashboardIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> );
const TriageIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> );
const ChildRegistryIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> );
const CertificateIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> );
const LearnIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> );
const FieldTeamsIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> );
const AnalyticsIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> );
const SettingsIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const SignOutIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> );

export default SidebarNav;