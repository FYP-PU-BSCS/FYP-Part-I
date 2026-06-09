import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import NewChildForm from "./NewChildForm";

const ChildRegistry = ({ language }) => {
  const isUrdu = language === 'ur';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("zero");
  const [selectedChild, setSelectedChild] = useState(null);
  const [viewDetailChild, setViewDetailChild] = useState(null);
  const [editingChild, setEditingChild] = useState(null);
  const [refusalReason, setRefusalReason] = useState("");
  
  const [children, setChildren] = useState([]);
  const [statsData, setStatsData] = useState({ vaccinated: 0, refusals: 0, missed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // --- HELPER: CALCULATE AGE IN MONTHS ---
  // Calculates the difference in months between today and DOB
  const getAgeInMonths = (dobString) => {
    if (!dobString) return 99; // If no DOB, keep in the general list (older kids)
    const dob = new Date(dobString);
    const today = new Date();
    return (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
  };

  // --- HELPER: SORTING LOGIC ---
  const sortChildren = (data) => {
    const priority = {
      'refused': 1,
      'missed': 2,
      'pending': 3,
      'vaccinated': 4
    };

    return [...data].sort((a, b) => {
      const statusA = a.vaccination_status?.toLowerCase() || 'pending';
      const statusB = b.vaccination_status?.toLowerCase() || 'pending';
      
      if (priority[statusA] !== priority[statusB]) {
        return priority[statusA] - priority[statusB];
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  // --- HELPER: AUTH HEADERS ---
  const getAuthHeaders = () => {
    const sessionData = localStorage.getItem("userSession");
    if (!sessionData) return {};

    try {
      const parsed = JSON.parse(sessionData);
      const token = parsed.access_token;
      return {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
    } catch (error) {
      return {
        headers: {
          'Authorization': `Bearer ${sessionData.replace(/"/g, '')}`,
          'Content-Type': 'application/json'
        }
      };
    }
  };

  // --- API CALL: FETCH ALL ---
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const config = getAuthHeaders();
      const [statsRes, listRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/api/child/stats", config),
        axios.get("http://127.0.0.1:5000/api/child/all", config)
      ]);

      if (statsRes.data.success) setStatsData(statsRes.data.stats);
      if (listRes.data.success) setChildren(listRes.data.children);
    } catch (err) {
      console.error("Fetch Error:", err.response?.status);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- API CALL: REGISTER/UPDATE ---
  const handleRegisterOrUpdate = async (formData) => {
    try {
      const payload = {
        db_id: editingChild ? editingChild.id : null, 
        full_name: formData.fullName,
        father_name: formData.guardianName,
        date_of_birth: formData.dob,
        gender: formData.gender,
        phone: formData.phone,
        house_number: formData.houseNo,
        street_number: formData.streetNo,
        category: formData.category
      };

      const res = await axios.post("http://127.0.0.1:5000/api/child/register", payload, getAuthHeaders());

      if (res.data.success) {
        setIsFormOpen(false);
        setEditingChild(null);
        await fetchAllData();
      }
    } catch (err) {
      alert(isUrdu ? "معلومات محفوظ نہیں ہو سکیں" : "Failed to save record");
    }
  };

  // --- API CALL: MARK VISIT ---
  const updateStatus = async (status) => {
    if (status === "REFUSED" && refusalReason.trim().length < 10) {
      alert(isUrdu ? "کم از کم 10 حروف کی تفصیل درج کریں" : "Please provide at least 10 characters for refusal");
      return;
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/child/mark-visit",
        {
          child_id: selectedChild.id,
          status: status.toLowerCase() === "n/a" ? "missed" : status.toLowerCase(),
          reason: refusalReason
        },
        getAuthHeaders()
      );

      if (res.data.success) {
        setSelectedChild(null);
        setRefusalReason("");
        fetchAllData();
      }
    } catch (err) {
      alert(isUrdu ? "دورہ محفوظ نہیں ہو سکا" : "Error marking visit");
    }
  };

  const stats = [
    { title: isUrdu ? "ویکسین شدہ" : "Vaccinated", count: statsData.vaccinated, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: isUrdu ? "انکاری کیسز" : "Refusals", count: statsData.refusals, color: "text-red-600", bg: "bg-red-50" },
    { title: isUrdu ? "رہ جانے والے" : "N/A (Missed)", count: statsData.missed, color: "text-orange-600", bg: "bg-orange-50" },
    { title: isUrdu ? "کل ریکارڈ" : "Total Records", count: statsData.total, color: "text-slate-700", bg: "bg-slate-50" },
  ];

  // --- TABLE RENDERER ---
  const RenderTable = ({ data, title }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mt-4">
      <div className={`px-8 py-4 bg-slate-50 border-b font-black text-[10px] text-slate-400 uppercase tracking-widest ${isUrdu ? 'text-right' : 'text-left'}`}>
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] table-fixed" dir={isUrdu ? "rtl" : "ltr"}>
          <thead className="bg-slate-50/30 text-[10px] font-black uppercase text-slate-400 border-b">
            <tr>
              <th className={`w-1/3 px-8 py-4 ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "بچے کا نام" : "Child Name"}</th>
              <th className={`w-1/4 px-6 py-4 ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "حالت اور دورے" : "Status & Visits"}</th>
              <th className="w-1/4 px-6 py-4 text-center">ID</th>
              <th className={`w-1/6 px-8 py-4 ${isUrdu ? 'text-left' : 'text-right'}`}>{isUrdu ? "کارروائی" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map(child => (
              <tr key={child.id} className="hover:bg-slate-50/50 transition-all">
                <td className={`px-8 py-5 ${isUrdu ? 'text-right' : 'text-left'}`}>
                  <div className="flex flex-col">
                    <button onClick={() => setViewDetailChild(child)} className={`font-bold text-slate-800 text-lg underline decoration-slate-200 underline-offset-4 hover:text-blue-600 transition-all ${isUrdu ? 'text-right' : 'text-left'}`}>
                      {child.full_name}
                    </button>
                    <div className="text-[11px] text-slate-400 font-medium mt-1">
                      {isUrdu ? "سرپرست: " : "Guardian: "}{child.father_name} | {child.custom_id}
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-5 ${isUrdu ? 'text-right' : 'text-left'}`}>
                  <div className="flex flex-col gap-2">
                    <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase ${
                      child.vaccination_status === 'vaccinated' ? 'bg-emerald-100 text-emerald-700' :
                      child.vaccination_status === 'refused' ? 'bg-red-100 text-red-700' :
                      child.vaccination_status === 'missed' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {child.vaccination_status}
                    </span>
                    <div className="flex gap-1 items-center">
                      {[1, 2, 3].map(v => (
                        <div key={v} className={`w-2 h-2 rounded-full ${child.visit_count >= v ? 'bg-blue-500' : 'bg-slate-200'}`} />
                      ))}
                      <span className="text-[9px] text-slate-400 font-bold mx-1 uppercase">{child.visit_count}/3 {isUrdu ? "دورے" : "VISITS"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center text-[11px] font-bold text-slate-400 font-mono">{child.custom_id}</td>
                <td className={`px-8 py-5 ${isUrdu ? 'text-left' : 'text-right'}`}>
                  {child.visit_count < 3 && child.vaccination_status !== "vaccinated" ? (
                    <button onClick={() => setSelectedChild(child)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-slate-800 shadow-md">
                      {isUrdu ? "دورہ درج کریں" : "MARK VISIT"}
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest border border-slate-100 px-3 py-2 rounded-lg">
                      {isUrdu ? "مکمل شدہ" : "Finalized"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && <p className="text-center py-10 text-slate-400 text-sm italic">{isUrdu ? "کوئی ریکارڈ نہیں ملا" : "No records found"}</p>}
      </div>
    </div>
  );

  return (
    <div className={`p-8 bg-white min-h-screen ${isUrdu ? 'font-urdu' : 'font-sans'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      <NewChildForm 
        isOpen={isFormOpen || !!editingChild} 
        onClose={() => { setIsFormOpen(false); setEditingChild(null); }} 
        onSubmit={handleRegisterOrUpdate}
        initialData={editingChild} 
        language={language}
      />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
          {isUrdu ? "مہم کا رجسٹر" : "Child Registry"}
        </h1>
        <button onClick={() => {setEditingChild(null); setIsFormOpen(true);}} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">
          {isUrdu ? "+ نیا اندراج" : "+ REGISTER"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} p-6 rounded-[24px] border-2 border-transparent shadow-sm flex flex-col justify-between h-32`}>
            <span className="text-[10px] font-black uppercase text-slate-400">{s.title}</span>
            <span className={`text-4xl font-black ${s.color}`}>{s.count}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 bg-slate-50 p-1.5 rounded-2xl w-fit border">
        <button onClick={() => setActiveTab("zero")} className={`px-6 py-2 rounded-xl font-black text-[11px] transition-all ${activeTab === 'zero' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:bg-slate-100'}`}>
          {isUrdu ? "زیرو ڈوز" : "ZERO DOSE"}
        </button>
        <button onClick={() => setActiveTab("vac")} className={`px-6 py-2 rounded-xl font-black text-[11px] transition-all ${activeTab === 'vac' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}>
          {isUrdu ? "1 سے 5 سال" : "1-5 DOSES"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse font-black uppercase tracking-widest text-xs italic">Loading Records...</div>
      ) : (
        <>
          {activeTab === 'zero' ? (
            <RenderTable 
              title={isUrdu ? "اعلیٰ ترجیح (12 ماہ سے کم)" : "High Priority (Under 12 Months)"} 
              // Filter: Only children younger than 12 months
              data={sortChildren(children.filter(c => getAgeInMonths(c.date_of_birth) < 12))} 
            />
          ) : (
            <RenderTable 
              title={isUrdu ? "جنرل لسٹ (1 سے 5 سال)" : "General List (1-5 Years)"} 
              // Filter: Children 12 months or older
              data={sortChildren(children.filter(c => getAgeInMonths(c.date_of_birth) >= 12))} 
            />
          )}
        </>
      )}

      <AnimatePresence>
        {viewDetailChild && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl relative ${isUrdu ? 'text-right' : 'text-left'}`}>
              <h2 className="text-3xl font-black text-slate-900">{viewDetailChild.full_name}</h2>
              <div className="grid grid-cols-2 gap-6 my-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">{isUrdu ? "سرپرست" : "Guardian"}</h4>
                      <p className="text-sm font-bold text-slate-800">{viewDetailChild.father_name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-1">{viewDetailChild.phone_number}</p>
                  </div>
                  <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">{isUrdu ? "گھرانہ" : "Household"}</h4>
                      <p className="text-sm font-bold text-slate-800">{isUrdu ? "مکان #" : "House #"} {viewDetailChild.house_number}</p>
                      <p className="text-xs text-slate-500 font-medium">{isUrdu ? "گلی #" : "Street #"} {viewDetailChild.street_number}</p>
                  </div>
              </div>
              {viewDetailChild.vaccination_status === 'refused' && viewDetailChild.refusal_reason && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                  <h4 className="text-[10px] font-black text-red-500 uppercase mb-1">{isUrdu ? "انکار کی وجہ" : "REFUSAL REASON"}</h4>
                  <p className="text-sm italic text-red-700">"{viewDetailChild.refusal_reason}"</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setEditingChild(viewDetailChild); setViewDetailChild(null); }} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs hover:bg-blue-700 transition-all">
                  {isUrdu ? "معلومات تبدیل کریں" : "EDIT INFO"}
                </button>
                <button onClick={() => setViewDetailChild(null)} className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all">
                  {isUrdu ? "بند کریں" : "CLOSE"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedChild && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-100 ${isUrdu ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-2xl font-black mb-1">{isUrdu ? "دورہ ریکارڈ کریں" : "Record Visit"}</h2>
                    <p className="text-slate-400 text-xs font-bold mb-6 uppercase tracking-wider">{isUrdu ? "بچہ: " : "Child: "} {selectedChild.full_name}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={() => updateStatus("VACCINATED")} className="bg-emerald-600 text-white py-5 rounded-2xl font-black text-[10px] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                          {isUrdu ? "ویکسین ہو گئی" : "VACCINATED"}
                        </button>
                        <button onClick={() => updateStatus("N/A")} className="bg-orange-500 text-white py-5 rounded-2xl font-black text-[10px] shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">
                          {isUrdu ? "گھر مقفل / میسر نہیں" : "N/A (LOCKED)"}
                        </button>
                    </div>

                    <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                        <h4 className="text-[10px] font-black text-red-400 uppercase mb-3 tracking-widest">{isUrdu ? "انکار کی صورت میں:" : "IN CASE OF REFUSAL:"}</h4>
                        <textarea 
                          value={refusalReason} 
                          onChange={(e) => setRefusalReason(e.target.value)} 
                          placeholder={isUrdu ? "انکار کی ٹھوس وجہ یہاں لکھیں..." : "Enter specific refusal reason here..."} 
                          className={`w-full p-4 rounded-2xl border-2 border-red-100 text-slate-800 text-sm outline-none mb-4 focus:border-red-300 transition-all placeholder:text-red-200 bg-white min-h-[80px] ${isUrdu ? 'text-right' : 'text-left'}`}
                        />
                        <button 
                          onClick={() => updateStatus("REFUSED")} 
                          className={`w-full py-4 rounded-xl font-black text-[11px] transition-all ${refusalReason.trim().length >= 10 ? 'bg-red-600 text-white shadow-lg shadow-red-100 active:scale-95' : 'bg-red-100 text-red-300 cursor-not-allowed'}`}
                        >
                          {isUrdu ? "انکار رجسٹر کریں" : "REGISTER REFUSAL"}
                        </button>
                    </div>
                    
                    <button onClick={() => {setSelectedChild(null); setRefusalReason("");}} className="w-full mt-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition-all">
                      {isUrdu ? "واپس جائیں" : "Cancel / Go Back"}
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChildRegistry;