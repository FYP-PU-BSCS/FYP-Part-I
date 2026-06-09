import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const CertificateRegistry = ({ user, language }) => {
  const isUrdu = language === 'ur';

  // --- English comment: State for API data ---
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [generationTime, setGenerationTime] = useState("");
  const [loading, setLoading] = useState(false);

  // --- English comment: Auth header logic for API calls ---
  const getAuthHeader = () => {
    const sessionRaw = localStorage.getItem("userSession"); 
    if (!sessionRaw) return { headers: {} };

    try {
      const sessionData = JSON.parse(sessionRaw);
      const token = sessionData.access_token; 
      return { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };
    } catch (err) {
      return { headers: {} };
    }
  };

  // --- English comment: Fetch certificates from Backend ---
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/certificate/list", getAuthHeader());
      const data = response.data.certificates || response.data;
      setChildren(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  // --- English comment: Refresh list via sync route ---
  const handleSync = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/certificate/sync-eligible", {}, getAuthHeader());
      if (response.status === 200 || response.status === 201) {
        alert(isUrdu ? "فہرست اپ ڈیٹ کر دی گئی ہے" : "List Refreshed successfully!");
        fetchCertificates();
      }
    } catch (error) {
      alert(isUrdu ? "ناکامی: دوبارہ کوشش کریں" : "Refresh Failed");
    }
  };

  useEffect(() => {
    const locale = isUrdu ? 'ur-PK' : 'en-GB';
    const now = new Date();
    setGenerationTime(now.toLocaleString(locale, { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true 
    }));
  }, [selectedChild, language]);

  const generateUniqueID = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CERT-${year}-${random}`;
  };

  const getValidHistory = (history) => {
    if (!history) return [];
    return history.filter(h => h.campaign && h.campaign.trim() !== "" && h.date !== "");
  };

  // --- English comment: DELETE Functionality with Backend integration ---
  const requestDelete = async (child) => {
    const msg = isUrdu 
      ? `کیا آپ واقعی "${child.name}" کا ریکارڈ حذف کرنا چاہتے ہیں؟`
      : `Are you sure you want to delete the record for "${child.name}"?`;
    
    if (window.confirm(msg)) {
        try {
          // English comment: Using ID for the delete route
          await axios.delete(`http://localhost:5000/api/certificate/delete/${child.id}`, getAuthHeader());
          setChildren(children.filter(c => c.id !== child.id));
          alert(isUrdu ? "ریکارڈ حذف کر دیا گیا" : "Record deleted successfully.");
        } catch (e) {
          alert(isUrdu ? "حذف کرنے میں ناکامی" : "Delete Failed: Resource not found or unauthorized.");
        }
    }
  };

  // --- English comment: ADD / SAVE logic with Backend storage ---
  const handleSave = async () => {
    if (!selectedChild.name.trim() || !selectedChild.guardian.trim() || !selectedChild.dob) {
      alert(isUrdu ? "براہ کرم تمام خانے پُر کریں۔" : "Please fill in all fields.");
      return;
    }
    
    const validHistory = getValidHistory(selectedChild.history).map((h, i) => ({ ...h, dose: i + 1 }));
    if (validHistory.length === 0) {
      alert(isUrdu ? "براہ کرم کم از کم ایک انٹری مکمل کریں۔" : "Please provide at least one entry.");
      return;
    }

    const payload = { ...selectedChild, history: validHistory };

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/certificate/add", payload, getAuthHeader());
      
      if (response.status === 200 || response.status === 201) {
        alert(isUrdu ? "ریکارڈ کامیابی سے محفوظ ہو گیا" : "Record saved to database successfully!");
        fetchCertificates(); 
        setIsEditing(false);
        setSelectedChild(null);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert(isUrdu ? "محفوظ کرنے میں غلطی" : "Error saving to database.");
    } finally {
      setLoading(false);
    }
  };

  // --- English comment: Updated PDF logic to show all data and footer timestamp ---
  const downloadPDF = (child) => {
    const validHistory = getValidHistory(child.history);
    const pageWidth = 595;
    const finalHeight = 600;

    const doc = new jsPDF("p", "px", [pageWidth, finalHeight]);

    // Border
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(1.5);
    doc.rect(20, 20, pageWidth - 40, finalHeight - 40);

    // Header
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text("MINISTRY OF NATIONAL HEALTH SERVICES & COORDINATION", pageWidth / 2, 55, { align: "center" });
    
    doc.setFontSize(20);
    doc.setTextColor(15, 118, 110);
    doc.text("VACCINATION COMPLETION CERTIFICATE", pageWidth / 2, 85, { align: "center" });

    // Child Information section
    doc.setDrawColor(15, 118, 110); doc.setLineWidth(2);
    doc.line(60, 130, 60, 180);

    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(150);
    doc.text("FULL NAME", 70, 138);
    doc.setTextColor(40, 40, 40); doc.setFontSize(16); doc.setFont("times", "normal"); 
    doc.text(child.name.toUpperCase(), 70, 155);
    doc.setFontSize(9); doc.setFont("courier", "bold"); doc.setTextColor(15, 118, 110);
    doc.text(`CERTIFICATE ID: ${child.id}`, 70, 170);

    doc.setFont("helvetica", "normal"); doc.setTextColor(80); doc.setFontSize(9);
    doc.text(`Guardian: ${child.guardian}`, 340, 150);
    doc.text(`Date of Birth: ${child.dob}`, 340, 165);

    // Table
    autoTable(doc, {
      startY: 245,
      head: [[isUrdu ? 'نمبر' : 'Dose No.', isUrdu ? 'مہم' : 'Campaign Description', isUrdu ? 'تاریخ' : 'Completion Date']],
      body: validHistory.map((h, i) => [`Dose 0${i + 1}`, h.campaign, h.date]),
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110], fontSize: 8, halign: 'center' },
      styles: { fontSize: 8, font: "times" },
      margin: { left: 60, right: 60 }
    });

    // --- English comment: Footer Timestamp & Authority ---
    const finalY = doc.lastAutoTable.finalY + 60;
    doc.setFontSize(7); doc.setTextColor(150);
    doc.text(`Audit Timestamp: ${generationTime}`, 60, finalY);
    doc.setFont("times", "italic"); doc.setFontSize(10); doc.setTextColor(15, 118, 110);
    doc.text(`${user?.name || "Official Registrar"}`, 450, finalY, { align: "center" });
    doc.setDrawColor(200); doc.line(390, finalY + 3, 510, finalY + 3);
    doc.setFont("helvetica", "bold"); doc.text("ISSUING AUTHORITY", 450, finalY + 12, { align: "center" });

    doc.save(`${child.name.replace(/\s+/g, '_')}_Certificate.pdf`);
  };

  return (
    <div className={`min-h-screen bg-slate-50 p-4 md:p-8 relative ${isUrdu ? 'font-urdu' : 'font-sans'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      <AnimatePresence mode="wait">
        {!selectedChild ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl border overflow-hidden">
            <div className="p-8 bg-teal-800 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold uppercase">{isUrdu ? "پولیو مینجمنٹ پورٹل" : "Polio Management Portal"}</h2>
                <p className="text-teal-200 text-xs font-medium">{isUrdu ? "نیشنل ہیلتھ سیکیورٹی رجسٹری" : "National Health Security Registry"}</p>
              </div>
              <button onClick={handleSync} className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded font-bold text-xs uppercase transition">
                {isUrdu ? "فہرست اپ ڈیٹ" : "Refresh List"}
              </button>
            </div>
            {loading ? (
                <div className="p-10 text-center text-teal-800 font-bold">{isUrdu ? "لوڈنگ..." : "Loading Registry..."}</div>
            ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className={`p-6 ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "پورا نام" : "Full Name"}</th>
                  <th className={`p-6 ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? "رجسٹری آئی ڈی" : "Registry ID"}</th>
                  <th className={`p-6 ${isUrdu ? 'text-left' : 'text-right'}`}>{isUrdu ? "اقدامات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {children.map(child => (
                  <tr key={child.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-6 font-bold text-slate-700">{child.name}</td>
                    <td className="p-6 font-mono text-sm text-teal-600">{child.id}</td>
                    <td className={`p-6 space-x-2 ${isUrdu ? 'text-left flex flex-row-reverse gap-2' : 'text-right'}`}>
                      <button onClick={() => downloadPDF(child)} className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-bold text-xs border border-teal-100">{isUrdu ? "ڈاؤن لوڈ" : "Download PDF"}</button>
                      <button onClick={() => setSelectedChild(child)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs">{isUrdu ? "ترمیم" : "Edit"}</button>
                      <button onClick={() => requestDelete(child)} className="text-red-400 font-bold text-xs px-2">{isUrdu ? "حذف" : "Delete"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
            <button onClick={() => {
              setSelectedChild({ id: generateUniqueID(), name: "", guardian: "", dob: "", history: [{ dose: 1, campaign: "", date: "" }] });
              setIsEditing(true);
            }} className={`fixed bottom-10 ${isUrdu ? 'left-10' : 'right-10'} w-16 h-16 bg-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center text-4xl hover:scale-110 transition-transform`}>+</button>
          </motion.div>
        ) : (
          <motion.div key="cert" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-4xl mx-auto">
             <div className="bg-white p-2 shadow-2xl border-[12px] border-double border-teal-900">
              <div className="border border-teal-800 p-8 md:p-16 bg-[#fffdfa]">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-2xl font-serif font-bold text-teal-900 italic">{isUrdu ? "ترمیم سرٹیفکیٹ" : "Modify Certificate"}</h2>
                        <span className="bg-teal-50 px-3 py-1 rounded font-mono text-teal-700 text-sm font-bold">{selectedChild.id}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input className="p-3 border-2 rounded-lg outline-none focus:border-teal-600 font-bold" value={selectedChild.name} onChange={(e) => setSelectedChild({...selectedChild, name: e.target.value})} placeholder={isUrdu ? "پورا نام" : "Full Name"} />
                      <input className="p-3 border-2 rounded-lg outline-none focus:border-teal-600 font-bold" value={selectedChild.guardian} onChange={(e) => setSelectedChild({...selectedChild, guardian: e.target.value})} placeholder={isUrdu ? "سرپرست" : "Guardian"} />
                      <input type="date" className="p-3 border-2 rounded-lg outline-none focus:border-teal-600 font-mono" value={selectedChild.dob} onChange={(e) => setSelectedChild({...selectedChild, dob: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center font-bold text-xs uppercase text-slate-400">{isUrdu ? "ویکسینیشن ریکارڈ" : "Vaccination History"} <button onClick={() => setSelectedChild({...selectedChild, history: [...selectedChild.history, {dose: 0, campaign: "", date: ""}]})} className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-[10px] tracking-widest">{isUrdu ? "+ ڈوز" : "+ ADD DOSE"}</button></div>
                      {selectedChild.history.map((h, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-[10px] font-bold text-teal-800 w-8">#{i+1}</span>
                          <input className="flex-1 p-2 border rounded text-sm outline-none focus:border-teal-600" placeholder={isUrdu ? "مہم" : "Campaign Name"} value={h.campaign} onChange={(e) => { const hists = [...selectedChild.history]; hists[i].campaign = e.target.value; setSelectedChild({...selectedChild, history: hists}); }} />
                          <input type="date" className="w-36 p-2 border rounded text-sm outline-none focus:border-teal-600" value={h.date} onChange={(e) => { const hists = [...selectedChild.history]; hists[i].date = e.target.value; setSelectedChild({...selectedChild, history: hists}); }} />
                          <button onClick={() => { const hists = selectedChild.history.filter((_, idx) => idx !== i); setSelectedChild({...selectedChild, history: hists}); }} className="p-2 text-red-400 hover:text-red-600">✕</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleSave} className="w-full bg-teal-900 text-white py-4 rounded-xl font-bold uppercase shadow-2xl hover:bg-black transition">{isUrdu ? "ریکارڈ محفوظ کریں" : "Verify & Save Record"}</button>
                  </div>
                ) : (
                    <div className="text-center">
                      <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-2">{isUrdu ? "ویکسینیشن مکمل ہونے کا سرٹیفکیٹ" : "Vaccination Completion Certificate"}</h1>
                      <div className="w-48 h-[2px] bg-teal-800 mx-auto mb-10"></div>
                      
                      <div className={`grid grid-cols-2 ${isUrdu ? 'text-right border-r-[6px] pr-8' : 'text-left border-l-[6px] pl-8'} max-w-2xl mx-auto mb-8 border-teal-800 py-4 bg-white/50`}>
                        <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isUrdu ? "بچے کا نام" : "Subject Name"}</p><p className="text-3xl font-serif font-medium text-slate-900">{selectedChild.name}</p></div>
                        <div className={`${isUrdu ? 'pr-10 border-r' : 'pl-10 border-l'} space-y-4`}>
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">{isUrdu ? "والد / سرپرست" : "Guardian"}</p><p className="text-base font-medium text-slate-800">{selectedChild.guardian}</p></div>
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">{isUrdu ? "تاریخ پیدائش" : "Date of Birth"}</p><p className="text-base font-mono text-slate-700">{selectedChild.dob}</p></div>
                        </div>
                      </div>

                      <div className="max-w-2xl mx-auto mb-10 py-6 border-y border-teal-50 italic font-serif text-slate-500 text-lg">
                        {isUrdu 
                          ? '"یہ دستاویز اس بات کی سرکاری گواہی ہے کہ مذکورہ بالا فرد نے نیشنل پولیو حفاظتی ٹیکہ جات کے شیڈول کی تمام ضروریات کو کامیابی کے ساتھ پورا کر لیا ہے۔"' 
                          : '"This document serves as official testimony that the above-mentioned individual has successfully fulfilled all requirements of the National Polio Immunization Schedule."'
                        }
                      </div>

                      <div className="max-w-2xl mx-auto border rounded-lg overflow-hidden mb-16 bg-white">
                        <table className="w-full text-sm font-serif">
                          <thead className="bg-teal-900 text-white uppercase text-[9px] tracking-[0.2em]">
                            <tr><th className="p-3">{isUrdu ? "ڈوز" : "Dose"}</th><th className={`${isUrdu ? 'text-right' : 'text-left'} p-3`}>{isUrdu ? "مہم" : "Campaign Name"}</th><th className={`${isUrdu ? 'text-left pl-6' : 'text-right pr-6'} p-3`}>{isUrdu ? "تاریخ" : "Date"}</th></tr>
                          </thead>
                          <tbody>
                            {getValidHistory(selectedChild.history).map((h, i) => (
                              <tr key={i} className="border-b last:border-0 border-teal-50">
                                <td className="p-3 font-bold text-teal-800 text-center italic">Dose 0{i + 1}</td>
                                <td className={`${isUrdu ? 'text-right' : 'text-left'} p-3 text-slate-600`}>{h.campaign}</td>
                                <td className={`${isUrdu ? 'text-left pl-6' : 'text-right pr-6'} p-3 font-mono text-slate-400`}>{h.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 justify-center mt-12 pb-12">
              <button onClick={() => { setSelectedChild(null); setIsEditing(false); }} className="px-8 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold">{isUrdu ? "واپس" : "Back"}</button>
              {!isEditing && (
                <>
                  <button onClick={() => setIsEditing(true)} className="px-10 py-3 border-2 border-teal-900 text-teal-900 rounded-xl font-bold">{isUrdu ? "ترمیم" : "Edit"}</button>
                  <button onClick={() => downloadPDF(selectedChild)} className="px-10 py-3 bg-teal-900 text-white rounded-xl font-bold shadow-2xl">{isUrdu ? "پی ڈی ایف" : "Download PDF"}</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificateRegistry;