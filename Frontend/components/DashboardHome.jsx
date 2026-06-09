import React, { useState, useEffect } from "react";
import axios from "axios";

const DashboardHome = ({ language }) => {
  const isUrdu = language === 'ur';
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Fetching dynamic data using access_token from userSession
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const sessionData = localStorage.getItem("userSession");
        if (!sessionData) return;

        // Extracting token safely to avoid 'utf-8' decode errors
        const parsedSession = JSON.parse(sessionData);
        const token = parsedSession?.access_token || parsedSession?.token; 

        const response = await axios.get("http://127.0.0.1:5000/api/report/dashboard/campaign-performance", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          // mapping backend stats to UI requirements
          const mappedStats = response.data.data.stats.map(s => ({
            ...s,
            label: isUrdu ? getUrduLabel(s.id) : s.label,
            //  Color logic: Green for coverage/verif, Lime for refusals
            color: s.id === 'refusals' ? "#a3e635" : "#22c55e",
            isPositive: s.id !== 'refusals'
          }));
          setStats(mappedStats);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh data when language or component mounts
  }, [isUrdu]);

  const getUrduLabel = (id) => {
    const labels = {
      coverage: "مہم کی کوریج",
      verification: "تصدیق کی شرح",
      refusals: "کل انکار"
    };
    return labels[id] || id;
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading Dashboard...</div>;

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 p-10 shadow-sm transition-all" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="mb-12">
        <h2 className={`text-[#334155] font-black text-2xl tracking-tight ${isUrdu ? 'font-urdu' : ''}`}>
          {isUrdu ? "پولیو مہم کی کارکردگی کا ڈیش بورڈ" : "Campaign Performance Dashboard"}
        </h2>
        <p className="text-slate-400 font-medium text-[15px] mt-1">
          {isUrdu ? "قومی انسدادِ پولیو کی کوششوں کی براہِ راست نگرانی" : "Real-time monitoring of national polio efforts"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => {
          const percentageValue = parseFloat(stat.value) || 0;
          // English comment: Circular math: 2 * PI * R (76) ≈ 477
          const strokeDasharray = 477;
          const strokeDashoffset = strokeDasharray - (strokeDasharray * percentageValue) / 100;

          return (
            <div 
              key={idx} 
              className="bg-white rounded-[20px] p-8 border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col items-center text-center transition-transform hover:scale-[1.02]"
            >
              {/* Circular Progress Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="88" cy="88" r="76" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
                  <circle 
                    cx="88" cy="88" r="76" 
                    stroke={stat.color} 
                    strokeWidth="14" 
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[34px] font-black text-[#1e293b] leading-none tracking-tighter">
                    {stat.value}%
                  </span>
                  
                  <span className="text-[12px] font-bold text-[#1e3a8a] uppercase tracking-wider mt-2">
                    {isUrdu ? `ہدف: ${stat.target}%` : `Target: ${stat.target}%`}
                  </span>
                </div>
              </div>

              <h3 className="text-[#475569] font-bold text-[17px] mb-6 tracking-wide">
                {stat.label}
              </h3>
              
              <div className={`flex items-center gap-2 font-bold text-[14px] ${stat.id === 'refusals' ? 'text-[#a3e635]' : 'text-emerald-500'}`}>
                 {stat.isPositive ? <UpTrend /> : <DownTrend color={stat.id === 'refusals' ? '#a3e635' : '#ef4444'} />}
                 <span>{stat.trend}</span> 
                 <span className="text-slate-400 font-semibold ml-1 text-[13px]">
                   {isUrdu ? "گزشتہ مہم کے مقابلے میں" : "vs last campaign"}
                 </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Icons (UpTrend and DownTrend remain the same)
const UpTrend = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const DownTrend = ({ color = "currentColor" }) => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={3}>
    <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

export default DashboardHome;