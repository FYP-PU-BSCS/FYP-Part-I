import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const PriorityTriage = ({ language }) => {
  const isUrdu = language === 'ur';
  const [filter, setFilter] = useState("ALL");
  const [selectedChild, setSelectedChild] = useState(null);
  
  // --- Backend State ---
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Helper: Get Auth Token from LocalStorage ---
  const getAuthHeaders = () => {
    const sessionData = localStorage.getItem("userSession");
    if (!sessionData) return {};
    const parsed = JSON.parse(sessionData);
    return {
      headers: {
        'Authorization': `Bearer ${parsed.access_token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // --- API Call: Fetch Triage Data (Missed/Refused Only) ---
  const fetchTriageData = useCallback(async () => {
    try {
      setLoading(true);
      const config = getAuthHeaders();
      const res = await axios.get("http://127.0.0.1:5000/api/child/triage", config);
      
      if (res.data.success) {
        setChildrenData(res.data.children);
      }
    } catch (err) {
      console.error("Error fetching triage records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTriageData();
  }, [fetchTriageData]);

  // --- Helper: Status Translation & Formatting ---
  const translateStatus = (status) => {
    const s = status?.toLowerCase();
    if (!isUrdu) return s?.toUpperCase();
    if (s === "missed") return "رہ جانے والے";
    if (s === "refused" || s === "refusal") return "انکار";
    return "تمام";
  };

  // --- Filter Logic: Ensure data goes to correct tabs ---
  const filteredData = childrenData.filter(child => {
    const status = child.vaccination_status?.toLowerCase();
    if (filter === "ALL") return true;
    if (filter === "REFUSAL") return status === "refused";
    if (filter === "MISSED") return status === "missed";
    return false;
  });

  return (
    <div className={`p-8 space-y-8 bg-slate-50/30 min-h-screen ${isUrdu ? 'font-urdu' : 'font-sans'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      
      {/* 1. HEADER & FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[#1e293b] font-black text-3xl tracking-tight uppercase italic">
            {isUrdu ? "ترجیحی جائزہ ڈیش بورڈ" : "Triage Dashboard"}
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1">
            {isUrdu ? "ناکام کوریج کا تجزیہ" : "Analysis of Failed Coverage"}
          </p>
        </div>

        <div className="flex bg-slate-200/40 p-1.5 rounded-2xl border border-slate-200 backdrop-blur-sm">
          {["ALL", "MISSED", "REFUSAL"].map((type) => (
            <button 
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === type ? "bg-white text-emerald-600 shadow-md" : "text-slate-500 hover:text-slate-800"}`}
            >
              {translateStatus(type)}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CHILD LIST */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
            <div className="text-center py-10 font-black text-slate-300 uppercase italic">Loading Triage Records...</div>
        ) : filteredData.map((child) => (
          <motion.div
            key={child.id}
            layout
            className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5 w-full md:w-1/3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${child.vaccination_status === 'refused' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                {child.full_name?.charAt(0)}
              </div>
              <div className={isUrdu ? "text-right" : "text-left"}>
                <h3 className="font-black text-slate-800 text-lg leading-tight">{child.full_name}</h3>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                    {isUrdu ? "والد کا نام: " : "Father Name: "} 
                    <span className="text-emerald-600 underline decoration-2">{child.father_name}</span>
                </p>
              </div>
            </div>

            <div className={`flex-1 px-6 border-slate-50 w-full ${isUrdu ? 'md:text-right border-r' : 'md:text-left border-x'} text-center`}>
              <p className="text-slate-400 text-[9px] font-black uppercase mb-1">{isUrdu ? "حالت اور وجہ" : "Status & Reason"}</p>
              <p className="text-slate-700 font-bold text-sm italic">
                {translateStatus(child.vaccination_status)} — <span className="text-slate-500 not-italic font-medium">{child.refusal_reason || (isUrdu ? "وجہ درج نہیں" : "No reason provided")}</span>
              </p>
            </div>

            <div className={`flex items-center gap-4 w-full md:w-1/4 ${isUrdu ? 'justify-start' : 'justify-end'}`}>
               <button 
                 onClick={() => setSelectedChild(child)}
                 className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95"
               >
                 {isUrdu ? "تفصیل دیکھیں" : "View Details"}
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. DETAILS MODAL */}
      <AnimatePresence>
        {selectedChild && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden ${isUrdu ? 'text-right' : 'text-left'}`}
              dir={isUrdu ? 'rtl' : 'ltr'}
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-10 text-white flex justify-between items-start">
                <div className={isUrdu ? "text-right" : "text-left"}>
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {isUrdu ? "سرکاری ریکارڈ" : "Official Record"}
                  </span>
                  <h2 className="text-4xl font-black italic mt-2 uppercase tracking-tighter">{selectedChild.full_name}</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">ID: {selectedChild.custom_id}</p>
                </div>
                <button onClick={() => setSelectedChild(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-xl">✕</button>
              </div>

              {/* Modal Body */}
              <div className="p-10 grid grid-cols-2 gap-8 bg-slate-50/50">
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{isUrdu ? "والد کا نام" : "Father's Name"}</p>
                  <p className="text-slate-800 font-bold text-base">{selectedChild.father_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{isUrdu ? "ایریا" : "Area"}</p>
                  <p className="text-emerald-600 font-black text-base">{selectedChild.area}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{isUrdu ? "رابطہ نمبر" : "Contact Number"}</p>
                  <p className="text-slate-800 font-bold text-base" dir="ltr">{selectedChild.phone_number}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{isUrdu ? "تاریخ پیدائش" : "Registry Date"}</p>
                  <p className="text-slate-800 font-bold text-base">{selectedChild.date_of_birth}</p>
                </div>

                <div className="col-span-2 pt-4 border-t border-slate-200">
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{isUrdu ? "گھر کا پتہ" : "Physical Address"}</p>
                   <p className="text-slate-800 font-bold text-base italic">
                     {isUrdu ? `مکان نمبر ${selectedChild.house_number}, گلی نمبر ${selectedChild.street_number}` : `House ${selectedChild.house_number}, Street ${selectedChild.street_number}, ${selectedChild.area}`}
                   </p>
                </div>

                <div className={`col-span-2 p-4 rounded-2xl flex justify-between items-center ${selectedChild.vaccination_status === 'refused' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                  <span className="font-black text-xs uppercase tracking-widest">
                    {isUrdu ? "ناکامی کی وجہ: " : "Failure Reason: "} {selectedChild.refusal_reason || "N/A"}
                  </span>
                  <span className="font-black text-xs uppercase tracking-widest underline italic">
                    {translateStatus(selectedChild.vaccination_status)}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-white border-t border-slate-100 flex justify-end">
                <button onClick={() => setSelectedChild(null)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
                    {isUrdu ? "پروفائل بند کریں" : "Close Profile"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriorityTriage;