import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

const FieldTeams = ({ user, language }) => {
  const isUrdu = language === 'ur';

  // --- States for Grouped Backend Data ---
  const [teamsData, setTeamsData] = useState({}); 
  const [loading, setLoading] = useState(true);

  // --- Fetch Data from team_bp ---
  useEffect(() => {
    const loadReportData = async () => {
      try {
        // English Comment: Authentication token retrieved from userSession as per custom instructions
        const sessionValue = localStorage.getItem("userSession");
        if (!sessionValue) return;

        const session = JSON.parse(sessionValue);
        const response = await axios.get("http://127.0.0.1:5000/api/team/field-report-data", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (response.data.success) {
          // English Comment: Store the grouped teamsData object
          setTeamsData(response.data.teamsData || {});
        }
      } catch (error) {
        console.error("Error fetching field report:", error);
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, []);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-container');
    const button = document.getElementById('download-btn');
    
    button.innerText = isUrdu ? "...پی ڈی ایف تیار ہو رہی ہے" : "Generating PDF...";
    button.style.opacity = "0.5";

    try {
      const canvas = await html2canvas(element, { 
        scale: 2, // Improved quality for PDF
        useCORS: true, 
        backgroundColor: "#ffffff" 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Master_Field_Report_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      alert(isUrdu ? "پی ڈی ایف ڈاؤن لوڈ کرنے میں دشواری پیش آئی" : "Failed to download PDF.");
    } finally {
      button.innerText = isUrdu ? "سسٹم میں پی ڈی ایف محفوظ کریں" : "Download PDF to System";
      button.style.opacity = "1";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400 font-black animate-pulse uppercase tracking-widest">
          {isUrdu ? "ڈیٹا لوڈ ہو رہا ہے..." : "Syncing Field Records..."}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 transition-all ${isUrdu ? 'font-urdu' : 'font-sans'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      
      {/* BROWSER UI */}
      <div className="flex justify-between items-center mb-8 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className={isUrdu ? "text-right" : "text-left"}>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
            {isUrdu ? "روزانہ کی آپریشنل لاگ" : "Daily Operational Log"}
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            {isUrdu ? "ڈائریکٹ سسٹم ڈاؤن لوڈ پورٹل" : "Direct System Download Port"}
          </p>
        </div>
        <button 
          id="download-btn"
          onClick={handleDownloadPDF}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl"
        >
          {isUrdu ? "سسٹم میں پی ڈی ایف محفوظ کریں" : "Download PDF to System"}
        </button>
      </div>

      {/* MAIN CONTAINER FOR ALL REPORTS */}
      <div id="report-container" className="space-y-12">
        {Object.keys(teamsData).length === 0 ? (
          <div className="text-center p-20 bg-white rounded-3xl text-slate-300 font-bold uppercase tracking-widest border-2 border-dashed border-slate-100">
             {isUrdu ? "کوئی ریکارڈ نہیں ملا" : "No Teams Registered"}
          </div>
        ) : (
          Object.keys(teamsData)
            // 🚨 IMPROVEMENT: Filter out keys that are empty strings, "None", or "null"
            .filter(key => key && key !== "None" && key !== "null" && key.trim() !== "")
            .map((teamKey) => {
              const team = teamsData[teamKey];
              const records = team.childrenRecords || [];

              // 🚨 IMPROVEMENT: Hide the entire section if no records exist for this team/area
              if (records.length === 0) return null;

              const stats = team.dailyStats || {};
              const vaccinatedList = records.filter(c => c.status === "VACCINATED");
              const missedList = records.filter(c => c.status === "MISSED");
              const refusalList = records.filter(c => c.status === "REFUSED");

              return (
                <div key={teamKey} className="bg-white p-10 border border-slate-200 shadow-sm rounded-sm mb-16">
                  
                  {/* REPORT HEADER */}
                  <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-8">
                    <div className={isUrdu ? "text-right" : "text-left"}>
                      <h2 className="text-3xl font-black text-slate-900 uppercase italic">
                          {isUrdu ? `فیلڈ رپورٹ: ${teamKey}` : `Field Report: ${teamKey}`}
                      </h2>
                      <p className="text-emerald-600 font-black text-[18px] uppercase tracking-widest">{stats.campaign || "Campaign 2026"}</p>
                    </div>
                    <div className={isUrdu ? 'text-left' : 'text-right'}>
                      <p className="text-[15px] font-black text-slate-400 uppercase">{isUrdu ? "نگران افسر" : "Lead Official"}</p>
                      <p className="text-sm font-black text-slate-800 uppercase italic">{user?.name} — {user?.role}</p>
                      <p className="text-[15px] font-bold text-slate-500">{new Date().toDateString()}</p>
                    </div>
                  </div>

                  {/* 1. VACCINATED TABLE */}
                  {vaccinatedList.length > 0 && (
                    <div className="mb-8 overflow-hidden">
                      <div className={`bg-emerald-600 text-white p-3 text-xs font-black uppercase tracking-widest ${isUrdu ? 'text-right' : 'text-left'}`}>
                        {isUrdu ? `01. ویکسین شدہ بچوں کا رجسٹر (${vaccinatedList.length})` : `01. Successfully Vaccinated Register (${vaccinatedList.length})`}
                      </div>
                      <table className="w-full border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="border p-2 text-xs uppercase text-center">{isUrdu ? "حوالہ نمبر" : "Ref ID"}</th>
                            <th className={`border p-2 text-xs uppercase ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "بچے کا نام" : "Child Name"}</th>
                            <th className={`border p-2 text-xs uppercase ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "والد/سرپرست" : "Guardian"}</th>
                            <th className="border p-2 text-xs uppercase text-center">{isUrdu ? "وقت" : "Timestamp"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vaccinatedList.map(c => (
                            <tr key={c.id}>
                              <td className="border p-2 text-center font-mono text-sm">{c.id}</td>
                              <td className={`border p-2 font-bold uppercase text-sm ${isUrdu ? 'text-right' : 'text-left'}`}>{c.name}</td>
                              <td className={`border p-2 uppercase text-sm ${isUrdu ? 'text-right' : 'text-left'}`}>{c.father}</td>
                              <td className="border p-2 text-center italic text-sm">{c.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 2. MISSED TABLE */}
                  {missedList.length > 0 && (
                    <div className="mb-8 overflow-hidden">
                      <div className={`bg-orange-500 text-white p-3 text-xs font-black uppercase tracking-widest ${isUrdu ? 'text-right' : 'text-left'}`}>
                        {isUrdu ? `02. رہ جانے والے کیسز کا لاگ (${missedList.length})` : `02. Missed Cases Log (${missedList.length})`}
                      </div>
                      <table className="w-full border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="border p-2 text-xs uppercase text-center">{isUrdu ? "حوالہ نمبر" : "Ref ID"}</th>
                            <th className={`border p-2 text-xs uppercase ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "بچے کا نام" : "Child Name"}</th>
                            <th className={`border p-2 text-xs uppercase ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "وجہ" : "Reason"}</th>
                            <th className="border p-2 text-xs uppercase text-center">{isUrdu ? "حالت" : "Status"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {missedList.map(c => (
                            <tr key={c.id}>
                              <td className="border p-2 text-center font-mono text-sm">{c.id}</td>
                              <td className={`border p-2 font-bold uppercase text-sm ${isUrdu ? 'text-right' : 'text-left'}`}>{c.name}</td>
                              <td className={`border p-2 italic text-sm ${isUrdu ? 'text-right' : 'text-left'}`}>{c.type}</td>
                              <td className="border p-2 text-center font-black text-orange-600 text-[10px]">
                                {isUrdu ? "دوبارہ دورہ" : "REVISIT"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 3. REFUSAL TABLE */}
                  {refusalList.length > 0 && (
                    <div className="mb-12 overflow-hidden">
                      <div className={`bg-red-600 text-white p-3 text-xs font-black uppercase tracking-widest ${isUrdu ? 'text-right' : 'text-left'}`}>
                        {isUrdu ? `03. انکار کرنے والے خاندانوں کا رجسٹر (${refusalList.length})` : `03. Community Refusal Register (${refusalList.length})`}
                      </div>
                      <table className="w-full border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="border p-2 text-xs uppercase text-center">{isUrdu ? "حوالہ نمبر" : "Ref ID"}</th>
                            <th className={`border p-2 text-xs uppercase ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "بچے کا نام" : "Child Name"}</th>
                            <th className={`border p-2 text-xs uppercase ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "وجہ انکار" : "Reason"}</th>
                            <th className="border p-2 text-xs uppercase text-center">{isUrdu ? "کارروائی" : "Action"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {refusalList.map(c => (
                            <tr key={c.id}>
                              <td className="border p-2 text-center font-mono text-sm">{c.id}</td>
                              <td className={`border p-2 font-bold uppercase text-sm ${isUrdu ? 'text-right' : 'text-left'}`}>{c.name}</td>
                              <td className={`border p-2 italic text-sm ${isUrdu ? 'text-right' : 'text-left'}`}>{c.type}</td>
                              <td className="border p-2 text-center font-black text-red-600 text-[10px]">
                                {isUrdu ? "اے آئی سی ایکشن" : "AIC ACTION"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SIGNATURE BLOCK PER TEAM */}
                  <div className="mt-20 grid grid-cols-3 gap-10" dir={isUrdu ? "rtl" : "ltr"}>
                    <div className="border-t-2 border-slate-900 pt-2 text-center">
                      <p className="text-[10px] font-black uppercase italic">{teamKey} Lead</p>
                      <p className="text-[10px] text-slate-400">{isUrdu ? "ٹیم لیڈ" : "Team Lead"}</p>
                    </div>
                    <div className="border-t-2 border-slate-300 pt-2 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">
                          {isUrdu ? "ایریا انچارج" : "Area Incharge"}
                      </p>
                    </div>
                    <div className="border-t-2 border-slate-300 pt-2 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">
                          {isUrdu ? "یو سی ایم او منظوری" : "UCMO Approval"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
        )} 
      </div>
    </div>
  );
};

export default FieldTeams;