import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Learn = ({ language }) => {
  const isUrdu = language === 'ur';
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef(null);

  // Chatbot state with language support
  const [chatMessages, setChatMessages] = useState([
    { 
      role: "bot", 
      text: isUrdu 
        ? "سمارٹ پولیو نالج ہب میں خوش آمدید۔ میں آج پروٹوکول کے بارے میں آپ کی کیا مدد کر سکتا ہوں؟" 
        : "Welcome to the Smart Polio Knowledge Hub. How can I assist you with protocols today?" 
    }
  ]);

  const faqs = [
    { 
      id: "01", 
      tag: isUrdu ? "تشخیص" : "DIAGNOSIS", 
      question: isUrdu ? "پولیو کی حتمی علامات کیا ہیں؟" : "What are the definitive symptoms of Poliomyelitis?", 
      answer: isUrdu 
        ? "علائم میں بخار، تھکاوٹ، سر درد سے لے کر گردن میں اکڑن اور اعضاء میں درد شامل ہے۔ سب سے حتمی علامت 'ایکیوٹ فلیڈ پیرالائسس' (AFP) ہے، جس میں اعضاء اچانک کمزور اور لٹک جاتے ہیں۔" 
        : "Symptoms progress from fever, fatigue, and headache to neck stiffness and limb pain. The most definitive sign is Acute Flaccid Paralysis (AFP), characterized by sudden 'floppy' weakness in limbs." 
    },
    { 
      id: "02", 
      tag: isUrdu ? "حفاظتی ٹیکہ جات" : "IMMUNIZATION", 
      question: isUrdu ? "ویکسین بار بار کیوں دی جاتی ہے؟" : "Why is the vaccine administered multiple times?", 
      answer: isUrdu 
        ? "ہر خوراک آنتوں اور خون کی قوت مدافعت میں اضافہ کرتی ہے۔ زیادہ خطرے والے علاقوں میں، متعدد خوراکیں اس بات کو یقینی بنانے کے لیے ضروری ہیں کہ بچہ پولیو کے تمام وائرسز سے 100٪ محفوظ رہے۔" 
        : "Each dose increases intestinal and blood immunity. In high-risk environments, multiple doses are essential to ensure the child is 100% protected against all circulating strains." 
    },
    { 
      id: "03", 
      tag: isUrdu ? "کولڈ چین" : "COLD CHAIN", 
      question: isUrdu ? "فیلڈ سرگرمیوں کے دوران سٹوریج پروٹوکول کیا ہیں؟" : "What are the storage protocols for field activities?", 
      answer: isUrdu 
        ? "ویکسین کو 2+ سے 8+ ڈگری سینٹی گریڈ کے درمیان رکھنا چاہیے۔ فیلڈ ٹرانزٹ کے دوران، برف کے پیک استعمال کریں اور ویکسین وائل مانیٹر (VVM) کی حالت کو مسلسل چیک کریں۔" 
        : "Vaccines must be maintained between +2°C and +8°C. During field transit, use conditioned ice packs and monitor the Vaccine Vial Monitor (VVM) status constantly." 
    },
    { 
      id: "04", 
      tag: isUrdu ? "آگاہی مہم" : "ADVOCACY", 
      question: isUrdu ? "کارکنان ویکسین سے انکار کرنے والوں کو کیسے قائل کریں؟" : "How should workers address vaccine hesitancy?", 
      answer: isUrdu 
        ? "ہمدردی اور حقائق پر توجہ دیں۔ انہیں سمجھائیں کہ پولیو کا کوئی علاج نہیں—صرف بچاؤ ہی ڈھال ہے۔ واضح کریں کہ یہ ویکسین عالمی سطح پر تصدیق شدہ اور بیمار بچوں کے لیے بھی محفوظ ہے۔" 
        : "Focus on empathy and facts. Explain that the vaccine has no cure—prevention is the only shield. Highlight that the vaccine is globally verified and safe for sick children." 
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const newMessages = [...chatMessages, { role: "user", text: userInput }];
    setChatMessages(newMessages);
    setUserInput("");
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: "bot", 
        text: isUrdu 
          ? "آپ کا سوال موصول ہو گیا۔ میں 2026 کے ڈیٹا بیس سے معلومات حاصل کر رہا ہوں۔ فوری مدد کے لیے اپنے ڈسٹرکٹ ہیلتھ آفیسر سے رابطہ کریں۔" 
          : "Query received. Accessing Section 2 (Logistics) of the 2026 Protocol Database. For urgent field support, please contact your District Health Officer." 
      }]);
    }, 1000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className={`max-w-6xl mx-auto space-y-8 pb-24 px-6 ${isUrdu ? 'font-urdu' : 'font-sans'}`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      
      {/* 1. BRANDED HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#22c55e] via-[#10b981] to-[#3b82f6] rounded-[32px] p-10 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">
              {isUrdu ? "سرکاری نالج بیس" : "Official Knowledge Base"}
            </span>
            <h1 className="text-4xl font-black tracking-tight italic">
              {isUrdu ? "فیلڈ انسائیکلوپیڈیا" : "Field Encyclopedia"}
            </h1>
            <p className="text-white/80 text-sm font-medium max-w-md italic">
              {isUrdu ? "پولیو کے خاتمے، کولڈ چین مینجمنٹ اور آگاہی کے لیے معیاری پروٹوکولز" : "Standardized protocols for eradication, cold chain management, and community advocacy."}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-white text-emerald-600 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all">
              {isUrdu ? "مکمل مینوئل ڈاؤن لوڈ کریں" : "Download Full Manual"}
            </button>
            <button onClick={() => window.print()} className="bg-emerald-700/30 text-white border border-white/20 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              {isUrdu ? "ریکارڈ پرنٹ کریں" : "Print Records"}
            </button>
          </div>
        </div>
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* 2. SEARCH INTERFACE */}
      <div className="relative group max-w-3xl mx-auto -mt-8 z-20">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isUrdu ? "پروٹوکولز، طبی منطق یا انکار کے حل تلاش کریں..." : "Search protocols, medical logic, or refusal handling..."} 
          className={`w-full bg-white border border-slate-200 py-5 ${isUrdu ? 'pr-14 pl-6' : 'pl-14 pr-6'} rounded-[24px] text-sm outline-none shadow-2xl font-medium`}
        />
        <svg className={`absolute ${isUrdu ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 3. FAQ GRID */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFaqs.map((faq, index) => (
          <div key={faq.id} className={`group border transition-all duration-300 rounded-[28px] overflow-hidden ${activeFaq === index ? "bg-white border-[#10b981] shadow-xl" : "bg-white border-slate-100 shadow-sm"}`}>
            <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full flex items-center justify-between p-7 text-left">
              <div className="flex items-center gap-8">
                <span className={`text-sm font-black font-mono ${activeFaq === index ? "text-[#10b981]" : "text-slate-300"}`}>{faq.id}</span>
                <div className="space-y-1">
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{faq.tag}</span>
                   <h3 className={`text-xl font-black tracking-tight ${isUrdu ? 'text-right' : 'text-left'}`}>{faq.question}</h3>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeFaq === index ? "bg-[#10b981] text-white rotate-180" : "bg-slate-50 text-slate-400"}`}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </button>
            <AnimatePresence>
              {activeFaq === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <div className={`${isUrdu ? 'pr-24 pl-8' : 'px-24'} pb-8`}>
                    <div className="p-6 bg-slate-50/80 rounded-[24px] border border-slate-100 text-slate-600 text-[15px] leading-relaxed font-medium italic">
                      {faq.answer}
                      <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          {isUrdu ? "تصدیق شدہ: ڈبلیو ایچ او-2026" : "Verified: WHO-AFP-2026"}
                        </span>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* 4. CHATBOT SYSTEM */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} 
            className={`fixed bottom-28 ${isUrdu ? 'left-8' : 'right-8'} w-[420px] h-[600px] bg-white rounded-[32px] shadow-2xl border flex flex-col z-[1000] overflow-hidden`}
          >
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center font-black">S</div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-widest">{isUrdu ? "اسمارٹ اسسٹنٹ" : "Smart Assistant"}</h4>
                    <span className="text-[9px] text-emerald-400 font-black uppercase">{isUrdu ? "ڈیٹا بیس فعال ہے" : "Database Active"}</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-5 rounded-[24px] text-xs font-semibold ${msg.role === "user" ? "bg-[#10b981] text-white" : "bg-white text-slate-700"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t flex gap-3">
              <input 
                value={userInput} 
                onChange={(e) => setUserInput(e.target.value)} 
                type="text" 
                placeholder={isUrdu ? "سوال پوچھیں..." : "Ask a question..."} 
                className="flex-1 bg-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none" 
              />
              <button type="submit" className="bg-[#10b981] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase">
                {isUrdu ? "بھیجیں" : "Send"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION TRIGGER */}
      <div className={`fixed bottom-10 ${isUrdu ? 'left-10' : 'right-10'} z-[100]`}>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)} 
          className={`flex items-center gap-4 p-2 ${isUrdu ? 'pr-2 pl-6' : 'pl-6 pr-2'} rounded-full shadow-2xl border-4 border-white ${isChatOpen ? "bg-slate-900" : "bg-gradient-to-r from-[#10b981] to-[#3b82f6]"}`}
        >
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
            {isChatOpen ? (isUrdu ? "بند کریں" : "Close AI") : (isUrdu ? "اسمارٹ AI" : "Smart AI")}
          </span>
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-emerald-600">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default Learn;