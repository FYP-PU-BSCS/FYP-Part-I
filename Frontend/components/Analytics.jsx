import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import axios from 'axios';

const Analytics = ({ language, t }) => {
  // --- Data States ---
  const [data, setData] = useState({
    summary: { total_missed: 0, total_refusals: 0 },
    teams: [],
    intervention: { critical_team_name: "N/A", critical_count: 0 }
  });
  const [loading, setLoading] = useState(true);

  // --- Fetch Data from Backend ---
useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const sessionData = localStorage.getItem('userSession');
      
      if (!sessionData) {
        console.error("No session found");
        setLoading(false);
        return;
      }

      // English Comment: Parse the session object and extract ONLY the access_token string
      let token = "";
      try {
        const parsed = JSON.parse(sessionData);
        token = parsed.access_token || parsed.token || sessionData; 
      } catch (e) {
        token = sessionData; // Fallback if it's already a string
      }

      const response = await axios.get('http://127.0.0.1:5000/api/analytics/summary', {
        headers: { 
          // English Comment: Clean the token from any extra quotes
          Authorization: `Bearer ${token.replace(/['"]+/g, '').trim()}` 
        }
      });
      
      if (response.data.success) {
        setData({
          summary: response.data.summary,
          teams: response.data.teams,
          intervention: response.data.intervention
        });
      }
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  fetchAnalytics();
}, []);

  const getStatusColor = (status) => {
    if (status === "Excellent") return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (status === "Fair") return "text-sky-600 bg-sky-50 border-sky-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  if (loading) return <div className="p-10 text-center font-black uppercase tracking-widest text-slate-400">Loading Intelligence...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans bg-white">
      
      {/* HEADER WITH SUMMARY BOXES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
            {language === 'ur' ? 'آپریشنل انٹیلیجنس' : 'Operational Intelligence'}
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 italic">
            {language === 'ur' ? 'یو سی ایم او اور ایریا انچارج کمانڈ سینٹر' : 'UCMO & Area Incharge Command Center'}
          </p>
        </div>
        <div className="flex gap-3">
           <div className="bg-sky-100 text-sky-800 px-6 py-3 rounded-2xl text-center border border-sky-200">
              <p className="text-[10px] font-black uppercase opacity-60">
                {language === 'ur' ? 'کل رہ جانے والے' : 'Total Missed'}
              </p>
              <p className="text-xl font-black">{data.summary.total_missed}</p>
           </div>
           <div className="bg-rose-100 text-rose-800 px-6 py-3 rounded-2xl text-center border border-rose-200">
              <p className="text-[10px] font-black uppercase opacity-80">
                {language === 'ur' ? 'کل انکار' : 'Total Refusals'}
              </p>
              <p className="text-xl font-black">{data.summary.total_refusals}</p>
           </div>
        </div>
      </div>

      {/* TEAM PERFORMANCE GRID */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-700 uppercase tracking-tight">
            {language === 'ur' ? 'فعال ٹیم مانیٹرنگ' : 'Active Team Monitoring'}
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {language === 'ur' ? 'فوری صورتحال' : 'Real-time Status'}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className={`px-8 py-6 ${language === 'ur' ? 'text-right' : 'text-left'}`}>
                    {language === 'ur' ? 'ٹیم / انچارج' : 'Team / Lead'}
                </th>
                <th className="px-8 py-6 text-center">{language === 'ur' ? 'کوریج' : 'Coverage'}</th>
                <th className="px-8 py-6 text-center">{language === 'ur' ? 'رہ جانے والے بچے' : 'Missed Children'}</th>
                <th className="px-8 py-6 text-center">{language === 'ur' ? 'انکار' : 'Refusals'}</th>
                <th className={`px-8 py-6 ${language === 'ur' ? 'text-left' : 'text-right'}`}>
                    {language === 'ur' ? 'کارروائی کی ضرورت' : 'Action Required'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.teams.map((team, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800 text-lg">{team.name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase">{team.lead}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-2xl font-black ${parseInt(team.coverage) < 80 ? 'text-rose-500' : 'text-slate-800'}`}>
                      {team.coverage}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-block px-4 py-1 rounded-full bg-slate-100 text-slate-600 font-black text-sm">
                      {team.missed}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-block px-4 py-1 rounded-full font-black text-sm ${team.refusals > 5 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                      {team.refusals}
                    </div>
                  </td>
                  <td className={`px-8 py-6 ${language === 'ur' ? 'text-left' : 'text-right'}`}>
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${getStatusColor(team.status)}`}>
                      {team.status === "Critical" 
                        ? (language === 'ur' ? "⚠️ فوری دورہ کریں" : "⚠️ Immediate Visit") 
                        : team.status === "Fair" 
                        ? (language === 'ur' ? "دوبارہ چیک کریں" : "Re-Check") 
                        : (language === 'ur' ? "تصدیق شدہ" : "Verified")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* DECISION INSIGHTS BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* INTERVENTION CARD */}
        <div className="p-8 rounded-[40px] bg-emerald-500 text-white shadow-xl shadow-emerald-100">
          <div className="flex justify-between items-start">
            <h3 className="font-black uppercase tracking-widest text-xs opacity-80">
                {language === 'ur' ? 'ترجیحی مداخلت' : 'Intervention Priority'}
            </h3>
            <span className="animate-pulse h-3 w-3 rounded-full bg-white/50"></span>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-2xl font-black leading-tight italic">
                {language === 'ur' 
                    ? `${data.intervention.critical_team_name} کو ایریا انچارج کی مداخلت کی ضرورت ہے۔` 
                    : `${data.intervention.critical_team_name} requires Area Incharge intervention.`}
            </p>
            <p className="text-sm font-bold opacity-90">
                {language === 'ur' 
                    ? `زیادہ انکار والے کلسٹر (${data.intervention.critical_count} کیسز) کی نشاندہی ہوئی۔ کمیونٹی عمائدین سے رابطہ کی سفارش کی جاتی ہے۔` 
                    : `High refusal cluster (${data.intervention.critical_count} cases) identified. Community elder engagement recommended.`}
            </p>
          </div>
        </div>

        {/* CATCH-UP PLAN CARD */}
        <div className="p-8 rounded-[40px] bg-sky-600 text-white shadow-xl shadow-sky-100">
          <div className="flex justify-between items-start text-sky-200">
            <h3 className="font-black uppercase tracking-widest text-xs opacity-80">
                {language === 'ur' ? 'کوریج کی حکمت عملی' : 'Catch-up Strategy'}
            </h3>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-2xl font-black leading-tight italic">
                {language === 'ur' 
                    ? "کوریج میں بہتری کے لیے شام کا پلان تیار ہے۔" 
                    : "Evening plan ready for coverage improvement."}
            </p>
            <p className="text-sm font-bold opacity-80 underline decoration-sky-300 underline-offset-4">
                {language === 'ur' 
                    ? `نوٹ: ${data.summary.total_missed} رہ جانے والے بچوں کی کوریج کے لیے ٹیموں کی ری-شیڈولنگ کی جا رہی ہے۔` 
                    : `Note: Rescheduling teams for evening catch-up of ${data.summary.total_missed} missed children.`}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;