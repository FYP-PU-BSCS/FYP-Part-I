import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; 

const NewChildForm = ({ isOpen, onClose, onSubmit, language, initialData }) => {
  const isUrdu = language === 'ur';
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "", dob: "", gender: "Male", category: "Between 1 - 5 years",
    guardianName: "", phone: "+92", streetNo: "", houseNo: "",
  });

  // Reset or Populate form when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: isUrdu ? (initialData.full_name_ur || "") : (initialData.full_name || ""),
        guardianName: isUrdu ? (initialData.guardian_ur || "") : (initialData.father_name || ""),
        dob: initialData.date_of_birth || "",
        gender: initialData.gender || "Male",
        category: initialData.age_category || "Between 1 - 5 years",
        phone: initialData.phone_number || "+92",
        streetNo: initialData.street_number || "",
        houseNo: initialData.house_number || "",
      });
    } else {
      setFormData({
        fullName: "", dob: "", gender: "Male", category: "Between 1 - 5 years",
        guardianName: "", phone: "+92", streetNo: "", houseNo: "",
      });
    }
  }, [initialData, isOpen, isUrdu]);

  const handleNameChange = (field, value) => {
    const alphabetsOnly = value.replace(/[^a-zA-Z\s\u0600-\u06FF]/g, "");
    if (alphabetsOnly.length <= 25) {
      setFormData({ ...formData, [field]: alphabetsOnly });
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value.startsWith("+92")) {
      const integersOnly = value.slice(3).replace(/\D/g, "");
      if (integersOnly.length <= 10) {
        setFormData({ ...formData, phone: "+92" + integersOnly });
      }
    }
  };

  // --- UPDATED SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // 1. Critical Guard: Prevent multiple submissions and block empty names
    if (loading || !formData.fullName.trim()) {
        console.log("Submission blocked: Loading or Name is empty");
        return;
    }
    
    setLoading(true);

    try {
        const sessionData = localStorage.getItem('userSession');
        const token = sessionData ? JSON.parse(sessionData).access_token : null;

        // Construct the payload to match Backend Schema keys
        const payload = {
            db_id: initialData?.id || null,
            full_name: formData.fullName,
            father_name: formData.guardianName,
            date_of_birth: formData.dob,
            gender: formData.gender,
            phone: formData.phone === "+92" ? null : formData.phone,
            street_number: formData.streetNo,
            house_number: formData.houseNo,
            category: formData.category
        };

        const response = await axios.post("http://127.0.0.1:5000/api/child/register", payload, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.success) {
            // 2. Notify Parent Component
            if (onSubmit) {
                onSubmit(response.data.child);
            }
            
            // 3. Close Modal immediately to prevent UI ghosting
            onClose(); 
            
            // 4. Reset loading after a small delay to ensure component is unmounted safely
            setTimeout(() => {
                setLoading(false);
                alert(isUrdu ? "کامیابی سے محفوظ ہو گیا۔" : "Saved Successfully!");
            }, 100);
        }

    } catch (error) {
        console.error("AXIOS ERROR:", error);
        
        // Always reset loading on error so user can try again
        setLoading(false);

        const errorData = error.response?.data;
        if (error.response?.status === 404) {
            alert("Backend URL not found (404). Check if server is running.");
        } else if (errorData?.errors) {
            // Show specific Marshmallow validation errors if available
            const errorMsg = JSON.stringify(errorData.errors);
            alert(isUrdu ? `ڈیٹا غلط ہے: ${errorMsg}` : `Validation Error: ${errorMsg}`);
        } else {
            alert(isUrdu ? "محفوظ کرنے میں خرابی!" : "Saving Error!");
        }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[160]" />
          <motion.div initial={{ x: isUrdu ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isUrdu ? "-100%" : "100%" }} className={`fixed ${isUrdu ? 'left-0' : 'right-0'} top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-[170] overflow-y-auto`} dir={isUrdu ? 'rtl' : 'ltr'}>
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black">{isUrdu ? 'اندراج فارم' : 'Registration Form'}</h2>
              <button onClick={onClose} className="text-xl hover:text-red-500 transition-colors">✕</button>
            </div>

            <form className="p-8 space-y-6" onSubmit={handleSubmit}>
              {/* Child Details Section */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-emerald-600 block tracking-widest">{isUrdu ? 'بچے کی تفصیلات' : 'Child Details'}</label>
                <input required value={formData.fullName} onChange={(e) => handleNameChange('fullName', e.target.value)} placeholder={isUrdu ? "بچے کا نام" : "Child Name"} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-all" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="p-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" />
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="p-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500">
                    <option value="Male">{isUrdu ? 'مرد' : 'Male'}</option>
                    <option value="Female">{isUrdu ? 'خاتون' : 'Female'}</option>
                  </select>
                </div>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500">
                  <option value="Between 1 - 5 years">{isUrdu ? '1 سے 5 سال کے درمیان' : '1-5 years'}</option>
                  <option value="Zero Dose">{isUrdu ? 'زیرو ڈوز' : 'Zero Dose'}</option>
                </select>
              </div>

              {/* Guardian Info Section */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-blue-600 block tracking-widest">{isUrdu ? 'سرپرست کی معلومات' : 'Guardian Info'}</label>
                <input required value={formData.guardianName} onChange={(e) => handleNameChange('guardianName', e.target.value)} placeholder={isUrdu ? "سرپرست کا نام" : "Guardian Name"} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 transition-all" />
                <input required type="tel" value={formData.phone} onChange={handlePhoneChange} placeholder="+92XXXXXXXXXX" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono" />
              </div>

              {/* Address Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">{isUrdu ? "گلی نمبر" : "Street #"}</label>
                  <input required value={formData.streetNo} onChange={(e) => setFormData({...formData, streetNo: e.target.value})} placeholder="e.g. 5-A" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">{isUrdu ? "مکان نمبر" : "House #"}</label>
                  <input required value={formData.houseNo} onChange={(e) => setFormData({...formData, houseNo: e.target.value})} placeholder="e.g. 102" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500" />
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-black text-white shadow-lg active:scale-95 transition-all ${loading ? 'bg-slate-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                {loading ? (isUrdu ? "پروسیسنگ..." : "SAVING...") : (initialData ? (isUrdu ? "اپڈیٹ کریں" : "UPDATE") : (isUrdu ? "محفوظ کریں" : "REGISTER"))}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewChildForm;