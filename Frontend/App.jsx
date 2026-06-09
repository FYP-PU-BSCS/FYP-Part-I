import React, { useState, useEffect } from "react";
import SidebarNav from "./components/SidebarNav";
import TopBar from "./components/TopBar";
import DashboardHome from "./components/DashBoard/DashboardHome";
import DistrictPerformance from "./components/DashBoard/DistrictPerformance";
import PriorityTriage from "./components/PriorityTriage/PriorityTriage";
import ChildRegistry from "./components/ChildRegistery/ChildRegistry";
import Learn from "./components/LearnFolder/Learn";
import Analytics from "./components/Analytics/Analytics";
import SignIn from "./components/SignIn";
import CertificateRegistry from "./components/Certificate/CertificateRegistry";
import FieldTeams from "./components/FieldTeams/FieldTeams";
import Settings from "./components/Settings/Settings";

// 1. Translation Dictionary
const translations = {
  en: {
    portalName: "Smart Polio Portal",
    tagline: "Record & Monitoring",
    dashboard: "Dashboard",
    triage: "Priority Triage",
    registry: "Child Registry",
    certificates: "Certificates",
    learn: "Learn / Training",
    teams: "Field Teams",
    analytics: "Analytics",
    settings: "Settings",
    signOut: "Sign Out",
    welcome: "Welcome back",
    langButton: "اردو میں تبدیل کریں"
  },
  ur: {
    portalName: "سمارٹ پولیو پورٹل",
    tagline: "ریکارڈ اور نگرانی",
    dashboard: "ڈیش بورڈ",
    triage: "ترجیحی ترتیب",
    registry: "بچوں کا اندراج",
    certificates: "سرٹیفکیٹ",
    learn: "تربیت اور سیکھنا",
    teams: "فیلڈ ٹیمیں",
    analytics: "تجزیات",
    settings: "ترتیبات",
    signOut: "سائن آؤٹ",
    welcome: "خوش آمدید",
    langButton: "English میں تبدیل کریں"
  }
};

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");
  const [language, setLanguage] = useState("en");

  // Helper function to get translation
  const t = translations[language];

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userSession");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    localStorage.setItem("userSession", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    setUser(null);
    setActivePage("Dashboard");
  };

  if (!user) return <SignIn onLogin={handleLogin} />;

  return (
    <div 
      className={`flex h-screen w-full bg-slate-50 overflow-hidden ${language === 'ur' ? 'font-urdu' : 'font-sans'}`} 
      dir={language === "ur" ? "rtl" : "ltr"}
    >
      {/* Sidebar Navigation */}
      <div className={`transition-all duration-500 bg-white border-r border-gray-200 h-full ${isSidebarOpen ? "w-[360px]" : "w-0 overflow-hidden"}`}>
        <SidebarNav 
          activePage={activePage} 
          setActivePage={setActivePage} 
          onLogout={handleLogout}
          language={language}
          t={t} 
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          user={user}
          language={language}
          t={t}
        />
      
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-[#f8fafc] p-10">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Dashboard Logic */}
            {activePage === "Dashboard" && (
              <>
                <DashboardHome t={t} language={language} />
                <DistrictPerformance t={t} language={language} /> 
              </>
            )}
            
            {/* Component Pages - All passed language={language} now */}
            {activePage === "Certificates" && <CertificateRegistry t={t} language={language} />}
            {activePage === "Priority Triage" && <PriorityTriage t={t} language={language} />}
            {activePage === "Child Registry" && <ChildRegistry t={t} language={language} />}
            {activePage === "Learn / Training" && <Learn t={t} language={language} />}
            {activePage === "Analytics" && <Analytics t={t} language={language} />}
            {activePage === "Field Teams" && <FieldTeams user={user} t={t} language={language} />}
            
            {/* Settings Page - Crucial for switching language */}
            {activePage === "Settings" && (
              <Settings 
                language={language} 
                setLanguage={setLanguage} 
                t={t} 
              />
            )}

            
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
